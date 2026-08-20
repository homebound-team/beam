import { useRef } from "react";
import { useTextField } from "react-aria";
import { Icon } from "src/components";
import { Only } from "src/Css";
import { useAiProposal } from "src/inputs/hooks/useAiProposal";
import { BeamTextFieldProps, TextFieldXss } from "src/interfaces";
import { useTestIds } from "src/utils";
import { TextFieldBase } from "../TextFieldBase";

interface TextFieldProps<X> extends BeamTextFieldProps<X> {}

export function MenuSearchField<X extends Only<TextFieldXss, X>>(props: TextFieldProps<X>) {
  const { value, proposedValue } = props;
  const { isAiMode, effectiveValue, onUserEdit } = useAiProposal(value, proposedValue);
  const tid = useTestIds(props);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { labelProps, inputProps } = useTextField({ ...props, value: effectiveValue }, inputRef);

  return (
    <TextFieldBase
      label=""
      labelProps={labelProps}
      inputProps={inputProps}
      startAdornment={<Icon icon="search" />}
      proposedValue={isAiMode ? proposedValue : undefined}
      originalValue={value}
      onUserEdit={onUserEdit}
      {...tid.search}
    />
  );
}
