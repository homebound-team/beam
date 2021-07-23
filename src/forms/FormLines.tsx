import { Css, Properties } from "src/Css";

export interface FormLinesProps {
  /** Let the user interleave group-less lines and grouped lines. */
  children: JSX.Element[];
  width?: "md" | "sm";
}

/**
 * Applies standard Form layout/size/spacing between lines.
 *
 * Lines can either be individual form fields, or a group of form fields
 * (see the `FieldGroup` component), where they will be laid out side-by-side.
 */
export function FormLines(props: FormLinesProps) {
  const { children, width = "md" } = props;
  return (
    <div
      css={{
        ...Css.df.flexColumn.wPx(sizes[width]).$,
        // Purposefully use this instead of childGap3 to put margin-bottom on the last line
        "& > *": Css.mb3.$,
      }}
    >
      {children}
    </div>
  );
}

/** Groups multiple fields side-by-side. */
export function FieldGroup(props: {
  /** The legend/title for this group. */
  title?: string;
  children: JSX.Element[];
  basis?: Properties["flexBasis"][];
}) {
  // TODO Actually use title
  const { title, children, basis = [] } = props;
  return (
    <div css={Css.df.childGap2.$}>
      {children.map((child, i) => (
        <div key={i} css={Css.fg1.fb(String(basis[i] || "100%")).$}>
          {child}
        </div>
      ))}
    </div>
  );
}

const sizes: Record<"md" | "sm", number> = {
  md: 480, // normal full-page size
  sm: 320, // works well in a modal
};
