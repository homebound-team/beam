import { Fragment } from "react";
import { Css } from "src/Css";

type Field = JSX.Element;

/** Either a field all by itself or multiple fields on a line. */
type FormLine = Field | Field[];

export interface FieldGroup {
  /** The legend/title for this group. */
  title: string;
  lines: FormLine[];
}

export interface FormLinesProps {
  /** Let the user inter-leave group-less lines and grouped lines. */
  children: Array<FormLine | FieldGroup>;
  width?: "md" | "sm";
}

const sizes: Record<"md" | "sm", number> = {
  md: 480, // normal full-page size
  sm: 320, // works well in a modal
};

/**
 * Applies standard Form layout/size/spacing between lines.
 *
 * Lines can either be individual form fields, or a group of form
 * fields, where they will be laid out side-by-side.
 *
 * TODO: Promote this to Beam?
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
      {children.map((field, i) => {
        if (field instanceof Array) {
          // This is an array of form lines, split evenly, i.e. as 50/50, 33/33/34, etc.
          return (
            <div key={i} css={Css.df.childGap2.$}>
              {field.map((f, i) => (
                <div key={i} css={Css.fb1.$}>
                  {f}
                </div>
              ))}
            </div>
          );
        } else {
          // This is a form line by itself
          return <Fragment key={i}>{field}</Fragment>;
        }
      })}
    </div>
  );
}
