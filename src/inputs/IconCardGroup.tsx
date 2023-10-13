import { ReactNode } from "react";
import { useCheckboxGroup } from "react-aria";
import { useCheckboxGroupState } from "react-stately";
import { Css } from "src/Css";
import { IconProps } from "src/components/Icon";
import { Label } from "src/components/Label";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { useTestIds } from "src/utils";
import { IconCard } from "src/inputs/IconCard";
import { HelperText } from "src/components/HelperText";
import { ErrorMessage } from "./ErrorMessage";

export interface IconCardGroupItemOption {
  icon: IconProps["icon"];
  label: string;
  disabled?: boolean;
  /** The value of the IconCardGroup item, stored in value array in state. */
  value: string;
}

export interface IconCardGroupProps extends Pick<PresentationFieldProps, "labelStyle"> {
  label: string;
  /** Called when a card is selected */
  onChange: (values: string[]) => void;
  /** Options for the cards contained within the IconCardGroup. */
  options: IconCardGroupItemOption[];
  /** The values currently selected. */
  values: string[];
  errorMsg?: string;
  helperText?: string | ReactNode;
  disabled?: boolean;
}

export function IconCardGroup(props: IconCardGroupProps) {
  const { fieldProps } = usePresentationContext();
  const {
    options,
    label,
    labelStyle = fieldProps?.labelStyle ?? "above",
    values,
    errorMsg,
    helperText,
    disabled: isDisabled = false,
  } = props;

  const state = useCheckboxGroupState({ ...props, isDisabled, value: values });
  const { groupProps, labelProps } = useCheckboxGroup(props, state);
  const tid = useTestIds(props);

  return (
    <div {...groupProps} {...tid}>
      {labelStyle !== "hidden" && (
        <div css={Css.if(labelStyle === "left").w50.$}>
          <Label label={label} {...labelProps} {...tid.label} />
        </div>
      )}
      <div css={Css.df.gap2.add({ flexWrap: "wrap" }).$}>
        {options.map((option) => {
          const { icon, label, disabled } = option;
          const isSelected = state.isSelected(option.value);
          const isDisabled = disabled || state.isDisabled;
          return (
            <IconCard
              key={option.value}
              icon={icon}
              label={label}
              selected={isSelected}
              disabled={isDisabled}
              onChange={() => state.toggleValue(option.value)}
              {...tid[option.value]}
            />
          );
        })}
      </div>
      {errorMsg && <ErrorMessage errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}
