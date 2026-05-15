import { createContext, PropsWithChildren, useContext } from "react";
import { Css } from "src/Css";

/** Must match the `contrast` theme axis in tokens and `[data-theme="contrast"]` in `src/css/generated/theme-scopes.css`. */
export const contrastDataTheme = "contrast" as const;

const ContrastScopeContext = createContext(false);

/**
 * Whether the tree is wrapped in an active {@link ContrastScope} (`contrast` prop true).
 * Used by portaled overlays (e.g. {@link Popover}) and by field chrome that needs contrast-specific ink.
 */
export function useContrastScope(): boolean {
  return useContext(ContrastScopeContext);
}

type ContrastScopeProps = PropsWithChildren<{ contrast?: boolean }>;

export function ContrastScope({ children, contrast = true }: ContrastScopeProps) {
  return (
    <ContrastScopeContext.Provider value={contrast}>
      <div css={Css.display("contents").$} data-theme={contrast ? contrastDataTheme : undefined}>
        {children}
      </div>
    </ContrastScopeContext.Provider>
  );
}
