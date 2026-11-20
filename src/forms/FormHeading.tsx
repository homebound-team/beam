import { Css, type Margin, type Xss } from "src/Css";

export interface FormHeadingProps {
  title: string;
  xss?: Xss<Margin>;
  /** Drops the top margin; `FormLines` sets it on its first heading. */
  isFirst?: boolean;
}

/** An `h3` heading that groups fields inside `FormLines`, with space above unless it's the first. */
export function FormHeading(props: FormHeadingProps) {
  const { title, xss, isFirst = false, ...others } = props;
  return (
    // Add space before the heading, but only if it's not first.
    <h3 css={{ ...Css.md.if(!isFirst).mt1.$, ...xss }} {...others}>
      {title}
    </h3>
  );
}

// https://github.com/gaearon/react-hot-loader/issues/304#issuecomment-456569720
FormHeading.isFormHeading = true;
