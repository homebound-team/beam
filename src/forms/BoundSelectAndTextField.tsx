import type { JSX } from "react";
import { CompoundField } from "src/components/internal/CompoundField";
import type { Only } from "src/Css";
import { BoundSelectField, type BoundSelectFieldProps } from "src/forms/BoundSelectField";
import { BoundTextField, type BoundTextFieldProps } from "src/forms/BoundTextField";
import type { Value } from "src/inputs/Value";
import type { TextFieldXss } from "src/interfaces";
import type { HasIdAndName, Optional } from "src/types";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

interface BoundSelectAndTextFieldProps<O, V extends Value, X> {
  selectFieldProps: CompoundSelectFieldProps<O, V>;
  textFieldProps: CompoundTextFieldProps<X>;
  compact?: boolean;
}

export function BoundSelectAndTextField<O, V extends Value, X extends Only<TextFieldXss, X>>(
  props: BoundSelectAndTextFieldProps<O, V, X>,
): JSX.Element;
export function BoundSelectAndTextField<O extends HasIdAndName<V>, V extends Value, X extends Only<TextFieldXss, X>>(
  props: Omit<BoundSelectAndTextFieldProps<O, V, X>, "selectFieldProps"> & {
    selectFieldProps: Optional<CompoundSelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">;
  },
): JSX.Element;
export function BoundSelectAndTextField<O extends HasIdAndName<V>, V extends Value, X extends Only<TextFieldXss, X>>(
  props: Omit<BoundSelectAndTextFieldProps<O, V, X>, "selectFieldProps"> & {
    selectFieldProps: Optional<CompoundSelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">;
  },
): JSX.Element {
  const { selectFieldProps, textFieldProps, compact = true } = props;
  const tid = useTestIds(props);
  return (
    <CompoundField>
      <BoundSelectField
        {...tid[defaultTestId(selectFieldProps.label ?? selectFieldProps.field.key)]}
        {...selectFieldProps}
        sizeToContent
        compact={compact}
      />
      <BoundTextField
        {...tid[defaultTestId(textFieldProps.label ?? textFieldProps.field.key)]}
        {...textFieldProps}
        compact={compact}
      />
    </CompoundField>
  );
}

type CompoundSelectFieldProps<O, V extends Value> = Omit<BoundSelectFieldProps<O, V>, "compact">;
type CompoundTextFieldProps<X> = Omit<BoundTextFieldProps<X>, "compact">;
