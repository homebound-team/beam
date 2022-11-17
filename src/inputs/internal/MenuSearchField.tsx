import { useTextField } from "@react-aria/textfield";
import { useRef } from "react";
import { Icon } from "src/components";
import { Css, Only } from "src/Css";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { useTestIds } from "src/utils";

interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  inlineLabel?: boolean;
}

export function MenuSearchField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const tid = useTestIds(props);
  const fieldStyles = {
    input: {
      ...Css.w100.mw0.outline0.bgWhite.p1.$,
    },
  };

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField({ ...props }, inputRef);

  return (
    <div css={Css.df.aic.fg1.bb.bGray200.$}>
      <span css={Css.ml1.pr1.$}>
        <Icon icon="search" />
      </span>
      <label {...labelProps}>{props.label}</label>
      <input
        {...inputProps}
        ref={inputRef}
        css={{
          ...fieldStyles.input,
        }}
        {...tid.search}
      />
    </div>
  );
}
