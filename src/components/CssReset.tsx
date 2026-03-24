import "./CssReset.css";

// Certain `a` tags in the app we want to opt-out of the default `a` / `a:visited` look
// & feel and always be the same non-visited blue (or whatever color they want).
// The is primarily for navigation, like breadcrumb links or tab links.
export const navLink = "navLink";

/**
 * Applies a CSS Reset that is based on modern-normalize + TW customizations.
 *
 * The reset styles are now in CssReset.css and are loaded via a side-effect
 * import. This component is kept for API compatibility — render it at the top
 * of your app to ensure the CSS file is included in the bundle.
 */
export function CssReset() {
  return null;
}
