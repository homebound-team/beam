// Patch getComputedStyle to handle nwsapi CSS selector parsing errors.
// React 18's useId() generates IDs with colons (e.g. `:r1:`), and react-aria embeds
// these in element IDs. When jsdom's getComputedStyle iterates CSS stylesheets via nwsapi,
// it throws SyntaxError on colons parsed as pseudo-classes. Catching the error is safe —
// jsdom only resolves the `visibility` property so tests are unaffected by the fallback.
const _origGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((elt: Element, pseudoElt?: string | null): CSSStyleDeclaration => {
  try {
    return _origGetComputedStyle(elt, pseudoElt);
  } catch {
    // nwsapi SyntaxError on colon-containing IDs — return empty computed style
    return _origGetComputedStyle(document.createElement("div"), pseudoElt);
  }
}) as typeof window.getComputedStyle;

export {};
