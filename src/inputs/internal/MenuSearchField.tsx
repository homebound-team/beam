import { useTextField } from "@react-aria/textfield";
import { useRef } from "react";
import { Icon } from "src/components";
import { Only } from "src/Css";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { useTestIds } from "src/utils";
import { TextFieldBase } from "../TextFieldBase";

interface TextFieldProps<X> extends BeamTextFieldProps<X> {
  inlineLabel: boolean;
}

export function MenuSearchField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const tid = useTestIds(props);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField({ ...props }, inputRef);

  return (
    <TextFieldBase
      label=""
      labelProps={labelProps}
      inputProps={inputProps}
      startAdornment={<Icon icon="search" />}
      {...tid.search}
    />
  );
}
