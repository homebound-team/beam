/**
 * Codemod: ensure components that call `useModal()` from `@homebound/beam` (or Beam relative
 * imports) render `{modal.portal}` (or `{alias.portal}`) in the same function body.
 *
 * Usage (from a consumer repo, with beam as a sibling):
 *
 *   npx jscodeshift -t ../beam/codemods/add-use-modal-portal.ts src \
 *     --extensions=tsx,ts,jsx,js --parser=tsx
 *
 * The transform is conservative:
 * - Handles `const modal = useModal()`, `const { openModal, ... } = useModal()`, and renames.
 * - If the hook result is already a single identifier, appends `{ident.portal}` before the
 *   last return (or at end of function body for arrow-expression conversions).
 * - If the hook is destructured without `portal`, rewrites to keep a `modal` (or existing)
 *   binding that includes portal, or adds `portal` to the destructure and renders it.
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

  function insertPortalBeforeReturn(fnPath: any, portalIdent: string) {
    const body = fnPath.value.body;
    if (!j.BlockStatement.check(body)) {
      // Arrow with expression body — wrap
      fnPath.value.body = j.blockStatement([
        j.returnStatement(
          j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
            j.jsxExpressionContainer(body),
            j.jsxExpressionContainer(j.memberExpression(j.identifier(portalIdent), j.identifier("portal"))),
          ]),
        ),
      ]);
      dirty = true;
      return;
    }

    const returns = body.body.filter((s: any) => j.ReturnStatement.check(s));
    if (returns.length === 0) {
      body.body.push(
        j.returnStatement(
          j.jsxExpressionContainer(j.memberExpression(j.identifier(portalIdent), j.identifier("portal"))),
        ),
      );
      dirty = true;
      return;
    }

    // Insert portal into the last return if it's JSX; otherwise append a fragment wrapper.
    const lastReturn = returns[returns.length - 1];
    const arg = lastReturn.argument;
    if (!arg) return;

    const portalExpr = j.jsxExpressionContainer(j.memberExpression(j.identifier(portalIdent), j.identifier("portal")));

    if (j.JSXElement.check(arg) || j.JSXFragment.check(arg)) {
      if (j.JSXFragment.check(arg)) {
        arg.children.push(portalExpr);
      } else {
        lastReturn.argument = j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
          j.jsxElement(arg.openingElement, arg.closingElement, arg.children),
          portalExpr,
        ]);
      }
      dirty = true;
      return;
    }

    // Return of non-JSX — wrap in fragment
    lastReturn.argument = j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
      j.jsxExpressionContainer(arg),
      portalExpr,
    ]);
    dirty = true;
  }

  function processFunction(fnPath: any) {
    // Find useModal() declarators in this function scope only (not nested functions).
    const declarators = j(fnPath)
      .find(j.VariableDeclarator)
      .filter((p: any) => {
        // Skip nested function scopes
        let parent = p.parent;
        while (parent) {
          if (
            parent.node === fnPath.node ||
            parent.value === fnPath.value
          ) {
            break;
          }
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
        if (!hasPortalJsx(fnPath, name)) {
          insertPortalBeforeReturn(fnPath, name);
        }
        return;
      }

      // const { openModal, closeModal } = useModal()
      if (j.ObjectPattern.check(id)) {
        const props = id.properties;
        let portalLocal: string | null = null;
        let hasPortalProp = false;
        let hostName = "modal";

        for (const prop of props) {
          if (!j.Property.check(prop) && !j.ObjectProperty.check(prop)) continue;
          const key = prop.key;
          const value = prop.value;
          if (j.Identifier.check(key) && key.name === "portal") {
            hasPortalProp = true;
            portalLocal = j.Identifier.check(value) ? value.name : "portal";
          }
        }

        if (!hasPortalProp) {
          // Prefer renaming to `const modal = useModal()` when destructure is simple enough,
          // otherwise add `portal` to the pattern.
          props.push(j.property("init", j.identifier("portal"), j.identifier("portal")));
          portalLocal = "portal";
          dirty = true;
        }

        if (portalLocal && !hasPortalJsx(fnPath, portalLocal === "portal" ? "portal" : portalLocal)) {
          // For destructured `portal`, JSX is `{portal}` not `{modal.portal}`
          if (portalLocal === "portal" || hasPortalProp) {
            // Insert `{portal}` — reuse insert logic with a fake member by wrapping
            const body = fnPath.value.body;
            if (j.BlockStatement.check(body)) {
              const returns = body.body.filter((s: any) => j.ReturnStatement.check(s));
              const lastReturn = returns[returns.length - 1];
              if (lastReturn?.argument && (j.JSXElement.check(lastReturn.argument) || j.JSXFragment.check(lastReturn.argument))) {
                const portalExpr = j.jsxExpressionContainer(j.identifier(portalLocal));
                if (j.JSXFragment.check(lastReturn.argument)) {
                  lastReturn.argument.children.push(portalExpr);
                } else {
                  const el = lastReturn.argument;
                  lastReturn.argument = j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [
                    j.jsxElement(el.openingElement, el.closingElement, el.children),
                    portalExpr,
                  ]);
                }
                dirty = true;
              } else {
                insertPortalBeforeReturn(fnPath, hostName);
              }
            }
          } else {
            insertPortalBeforeReturn(fnPath, portalLocal);
          }
        }
      }
    });
  }

  root.find(j.FunctionDeclaration).forEach(processFunction);
  root.find(j.FunctionExpression).forEach(processFunction);
  root.find(j.ArrowFunctionExpression).forEach(processFunction);

  return dirty ? root.toSource({ quote: "double" }) : file.source;
}
