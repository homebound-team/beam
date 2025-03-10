import { Icon, IconKey } from "src/components";
import { Css, Margin, Xss } from "src/Css";

export interface FormHeadingProps {
  title: string;
  xss?: Xss<Margin>;
  // This is passed automatically by FormLines
  isFirst?: boolean;
  icon?: IconKey;
}

export function FormHeading(props: FormHeadingProps) {
  const { title, xss, isFirst = false, icon, ...others } = props;
  return (
    <h3
      css={{
        ...Css.baseMd.df.gap1.$,
        // Add space before the heading, but only if it's not first.
        ...(!isFirst && Css.mt4.$),
        ...xss,
      }}
      {...others}
    >
      {icon && <Icon icon={icon} />}
      {title}
    </h3>
  );
}

// https://github.com/gaearon/react-hot-loader/issues/304#issuecomment-456569720
FormHeading.isFormHeading = true;
