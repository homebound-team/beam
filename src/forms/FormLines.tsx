import { Css } from "src/Css";

export type FormWidth = "sm" | "md" | "lg";

export interface FormLinesProps {
  /** Let the user interleave group-less lines and grouped lines. */
  children: JSX.Element[];
  width?: FormWidth;
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
  /** An array of widths for each child, if a number we use `fr` units. */
  widths?: Array<number | string>;
}) {
  // TODO Actually use title
  const { title, children, widths = [] } = props;
  const gtc = children
    .map((_, i) => {
      const width = widths[i] || 1;
      return typeof width === `number` ? `${width}fr` : width;
    })
    .join(" ");
  return (
    <div css={Css.dg.gap2.gtc(gtc).$}>
      {children.map((child) => {
        return child;
      })}
    </div>
  );
}

const sizes: Record<FormWidth, number> = {
  lg: 550, // works well for side-by-side
  md: 480, // normal full-page size
  sm: 320, // works well in a modal
};
