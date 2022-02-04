import { Css, Margin, Xss } from "src/Css";

export interface FormHeadingProps {
  title: string;
  xss?: Xss<Margin>;
  // This is passed automatically by FormLines
  isFirst?: boolean;
}

export function FormHeading(props: FormHeadingProps) {
  const { title, xss, isFirst = false, ...others } = props;
  return (
    <h3
      css={{
        ...Css.baseEm.$,
        // Add space before the heading, but only if it's not first.
        ...(!isFirst && Css.mt4.$),
        ...xss,
      }}
      {...others}
    >
      {title}
    </h3>
  );
}

// https://github.com/gaearon/react-hot-loader/issues/304#issuecomment-456569720
FormHeading.isFormHeading = true;
