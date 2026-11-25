import type { ReactNode } from "react";
import { type PresentationFieldProps, PresentationProvider } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type FieldLayoutProps = {
  children: ReactNode;
} & Pick<PresentationFieldProps, "labelStyle" | "labelSuffix" | "compact">;

/**
 * Stacks fields vertically, using the same gap as `FieldRow`.
 *
 * Label settings apply to every field inside.
 */
export function FieldLayout(props: FieldLayoutProps) {
  const { children, labelSuffix, labelStyle, compact } = props;
  const tid = useTestIds(props, "fieldLayout");

  // Only overwrite `fieldProps` for props that were passed, so an omitted prop does not reset a parent's value.
  const newFieldProps = {
    ...("labelSuffix" in props ? { labelSuffix } : {}),
    ...("labelStyle" in props ? { labelStyle } : {}),
    ...("compact" in props ? { compact } : {}),
  };

  return (
    <PresentationProvider fieldProps={newFieldProps}>
      <div css={Css.df.fdc.gap2.$} {...tid}>
        {children}
      </div>
    </PresentationProvider>
  );
}
