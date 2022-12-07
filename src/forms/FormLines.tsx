import { Children, cloneElement, ReactElement, ReactNode } from "react";
import { LabelSuffixStyle, PresentationProvider } from "src/components/PresentationContext";
import { Css } from "src/Css";

export type FormWidth =
  /** 320px. */
  | "sm"
  /** 480px, works well in a small, single-stack form. */
  | "md"
  /** 550px, works well for showing side-by-side/double-stack fields. */
  | "lg"
  /** 100%, works well for showing full width fields, or deferring to the parent width. */
  | "full";

export interface FormLinesProps {
  /** Let the user interleave group-less lines and grouped lines. */
  children: ReactNode;
  labelSuffix?: LabelSuffixStyle;
  width?: FormWidth;
  compact?: boolean;
  /** Creates a horizontal form field */
  horizontalLayout?: boolean;
}

/**
 * Applies standard Form layout/size/spacing between lines.
 *
 * Lines can either be individual form fields, or a group of form fields
 * (see the `FieldGroup` component), where they will be laid out side-by-side.
 */
export function FormLines(props: FormLinesProps) {
  const { children, width = "full", labelSuffix, compact, horizontalLayout } = props;
  let firstFormHeading = true;

  // Only overwrite `fieldProps` if new values are explicitly set. Ensures we only set to `undefined` if explicitly set.
  const newFieldProps = {
    ...("labelSuffix" in props ? { labelSuffix } : {}),
    ...("compact" in props ? { compact } : {}),
  };

  return (
    <PresentationProvider fieldProps={newFieldProps}>
      <div
        css={{
          // Note that we're purposefully not using display:flex so that our children's margins will collapse.
          ...Css.w(sizes[width]).$,
          // Purposefully use this instead of childGap3 to put margin-bottom on the last line
          "& > *": Css.mb2.$,
        }}
      >
        {Children.map(children, (child) => {
          if (child && typeof child === "object" && "type" in child && (child.type as any).isFormHeading) {
            const clone = cloneElement(child, { isFirst: firstFormHeading });
            firstFormHeading = false;
            return clone;
          } else if (horizontalLayout && typeof child === "object" && (child as ReactElement).props?.label) {
            return (
              <div css={Css.df.$}>
                {/* get the label from the Form field */}
                <div css={Css.mw50.sm.gray700.my("auto").$}>{(child as ReactElement).props.label}</div>
                {child}
              </div>
            );
          } else {
            return child;
          }
        })}
      </div>
    </PresentationProvider>
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
  return <div css={Css.dg.gap2.gtc(gtc).$}>{children}</div>;
}

const sizes: Record<FormWidth, string> = {
  full: "100%",
  lg: "550px",
  md: "480px",
  sm: "320px",
};
