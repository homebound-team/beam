import { Css } from "src/Css";
import { FormContext, LabelSuffixStyle } from "src/forms/FormContext";

export type FormWidth =
  /** 320px, works well in a modal. */
  | "sm"
  /** 480px, works well in a small, single-stack form. */
  | "md"
  /** 550px, works well for showing side-by-side/double-stack fields. */
  | "lg";

export interface FormLinesProps {
  /** Let the user interleave group-less lines and grouped lines. */
  children: JSX.Element[];
  labelSuffix?: LabelSuffixStyle;
  width?: FormWidth;
}

/**
 * Applies standard Form layout/size/spacing between lines.
 *
 * Lines can either be individual form fields, or a group of form fields
 * (see the `FieldGroup` component), where they will be laid out side-by-side.
 */
export function FormLines(props: FormLinesProps) {
  const { children, width = "md", labelSuffix = "none" } = props;
  return (
    <FormContext.Provider value={{ labelSuffix }}>
      <div
        css={{
          ...Css.df.flexColumn.wPx(sizes[width]).$,
          // Purposefully use this instead of childGap3 to put margin-bottom on the last line
          "& > *": Css.mb3.$,
        }}
      >
        {children}
      </div>
    </FormContext.Provider>
  );
}

/** Draws a line between form lines. */
export function FormDivider() {
  return <div css={Css.hPx(1).my2.bgGray200.$} />;
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
  lg: 550,
  md: 480,
  sm: 320,
};
