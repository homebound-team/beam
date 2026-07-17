/**
 * Codemod: ensure components that call `useModal()` from `@homebound/beam` (or Beam relative
 * imports) render `{modal.portal}` (or `{alias.portal}` / `{portal}`) in the same function body.
 *
 * Usage (from a consumer repo, with beam as a sibling):
 *
 *   npx jscodeshift -t ../beam/codemods/add-use-modal-portal.ts src \
 *     --extensions=tsx,ts,jsx,js --parser=tsx
 *
 * The transform is conservative:
 * - Handles `const modal = useModal()`, `const { openModal, ... } = useModal()`, and renames.
 * - Only inserts a portal outlet into JSX returns (element or fragment).
 * - If the function returns an ObjectExpression (common for wrapper hooks), adds `portal` to
 *   that object instead of wrapping in a fragment.
 * - Skips other non-JSX returns (arrays, identifiers, call expressions, etc.) so callers can
 *   fix those stragglers manually — never wraps them in `<>...</>`.
 */

export default function transformer(file: any, api: any) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirty = false;

  function isUseModalCallee(callee: any): boolean {
    if (j.Identifier.check(callee) && callee.name === "useModal") return true;
    if (j.MemberExpression.check(callee) && j.Identifier.check(callee.property) && callee.property.name === "useModal") {
      return true;
    }
    return false;
  }

  function hasPortalJsx(fnPath: any, portalIdent: string): boolean {
    return (
      j(fnPath)
        .find(j.JSXExpressionContainer)
        .filter((p: any) => {
          const expr = p.value.expression;
          // {portal}
          if (j.Identifier.check(expr) && expr.name === portalIdent) return true;
          // {modal.portal}
          return (
            j.MemberExpression.check(expr) &&
            j.Identifier.check(expr.object) &&
            expr.object.name === portalIdent &&
            j.Identifier.check(expr.property) &&
            expr.property.name === "portal"
          );
        })
        .size() > 0
    );
  }

  function hasPortalInReturnedObject(fnPath: any): boolean {
    const body = fnPath.value.body;
    if (!j.BlockStatement.check(body)) {
      return j.ObjectExpression.check(body) && objectHasPortalProp(body);
    }
    return body.body.some((s: any) => {
      if (!j.ReturnStatement.check(s) || !s.argument) return false;
      return j.ObjectExpression.check(s.argument) && objectHasPortalProp(s.argument);
    });
  }

  function objectHasPortalProp(obj: any): boolean {
    return obj.properties.some((prop: any) => {
      if (!j.Property.check(prop) && !j.ObjectProperty.check(prop) && !j.SpreadProperty.check(prop)) return false;
      if (j.SpreadProperty.check(prop) || prop.type === "SpreadElement") return false;
      const key = prop.key;
      return (j.Identifier.check(key) && key.name === "portal") || (j.Literal.check(key) && key.value === "portal");
    });
  }

  function portalJsxExpr(portalIdent: string, asMember: boolean) {
    const expr = asMember
      ? j.memberExpression(j.identifier(portalIdent), j.identifier("portal"))
      : j.identifier(portalIdent);
    return j.jsxExpressionContainer(expr);
  }

  function insertPortalIntoJsxReturn(lastReturn: any, portalIdent: string, asMember: boolean): boolean {
    const arg = lastReturn.argument;
    if (!arg) return false;
    const portalExpr = portalJsxExpr(portalIdent, asMember);

    if (j.JSXFragment.check(arg)) {
      arg.children.push(portalExpr);
      return true;
    }
    if (j.JSXElement.check(arg)) {
      lastReturn.argument = j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
        j.jsxElement(arg.openingElement, arg.closingElement, arg.children),
        portalExpr,
      ]);
      return true;
    }
    return false;
  }

  function addPortalToObjectReturn(lastReturn: any, portalIdent: string): boolean {
    const arg = lastReturn.argument;
    if (!arg || !j.ObjectExpression.check(arg)) return false;
    if (objectHasPortalProp(arg)) return false;
    arg.properties.push(j.property("init", j.identifier("portal"), j.identifier(portalIdent)));
    return true;
  }

  /** Returns true if portal was placed (JSX or object). False = straggler, skip mutating destructure. */
  function placePortalOutlet(fnPath: any, portalIdent: string, asMember: boolean): boolean {
    const body = fnPath.value.body;

    // Arrow with expression body
    if (!j.BlockStatement.check(body)) {
      if (j.JSXElement.check(body) || j.JSXFragment.check(body)) {
        const portalExpr = portalJsxExpr(portalIdent, asMember);
        if (j.JSXFragment.check(body)) {
          body.children.push(portalExpr);
        } else {
          fnPath.value.body = j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
            j.jsxElement(body.openingElement, body.closingElement, body.children),
            portalExpr,
          ]);
        }
        return true;
      }
      if (j.ObjectExpression.check(body)) {
        if (!objectHasPortalProp(body)) {
          body.properties.push(j.property("init", j.identifier("portal"), j.identifier(portalIdent)));
        }
        return true;
      }
      // Non-JSX expression body — leave alone
      return false;
    }

    const returns = body.body.filter((s: any) => j.ReturnStatement.check(s));
    if (returns.length === 0) return false;

    const lastReturn = returns[returns.length - 1];
    if (!lastReturn.argument) return false;

    if (insertPortalIntoJsxReturn(lastReturn, portalIdent, asMember)) return true;
    if (addPortalToObjectReturn(lastReturn, portalIdent)) return true;
    return false;
  }

  function processFunction(fnPath: any) {
    const declarators = j(fnPath)
      .find(j.VariableDeclarator)
      .filter((p: any) => {
        let parent = p.parent;
        while (parent) {
          if (parent.node === fnPath.node || parent.value === fnPath.value) break;
          if (
            j.FunctionDeclaration.check(parent.value) ||
            j.FunctionExpression.check(parent.value) ||
            j.ArrowFunctionExpression.check(parent.value)
          ) {
            return false;
          }
          parent = parent.parent;
        }
        const init = p.value.init;
        return init && j.CallExpression.check(init) && isUseModalCallee(init.callee);
      });

    declarators.forEach((declPath: any) => {
      const id = declPath.value.id;

      // const modal = useModal()
      if (j.Identifier.check(id)) {
        const name = id.name;
        if (hasPortalJsx(fnPath, name) || hasPortalInReturnedObject(fnPath)) return;
        if (placePortalOutlet(fnPath, name, true)) dirty = true;
        return;
      }

      // const { openModal, closeModal } = useModal()
      if (j.ObjectPattern.check(id)) {
        let portalLocal: string | null = null;
        let hasPortalProp = false;

        for (const prop of id.properties) {
          if (!j.Property.check(prop) && !j.ObjectProperty.check(prop)) continue;
          const key = prop.key;
          const value = prop.value;
          if (j.Identifier.check(key) && key.name === "portal") {
            hasPortalProp = true;
            portalLocal = j.Identifier.check(value) ? value.name : "portal";
          }
        }

        if (hasPortalJsx(fnPath, portalLocal ?? "portal") || hasPortalInReturnedObject(fnPath)) return;

        // Try placing outlet first; only mutate the destructure if we can place it.
        const localName = portalLocal ?? "portal";
        const asMember = false; // destructured portal renders as {portal}
        const placed = placePortalOutlet(fnPath, localName, asMember);
        if (!placed) return;

        if (!hasPortalProp) {
          id.properties.push(j.property("init", j.identifier("portal"), j.identifier("portal")));
        }
        dirty = true;
      }
    });
  }

  root.find(j.FunctionDeclaration).forEach(processFunction);
  root.find(j.FunctionExpression).forEach(processFunction);
  root.find(j.ArrowFunctionExpression).forEach(processFunction);

  // Preserve existing quote style / formatting as much as recast allows
  return dirty ? root.toSource() : file.source;
}
