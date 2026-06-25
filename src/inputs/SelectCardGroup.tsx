import { ReactNode, useCallback, useMemo, useState } from "react";
import { mergeProps, useField } from "react-aria";
import { HelperText } from "src/components/HelperText";
import { IconProps } from "src/components/Icon";
import { Label } from "src/components/Label";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { Value } from "src/inputs";
import { SelectCard } from "src/inputs/SelectCard";
import { useTestIds } from "src/utils";
import { ErrorMessage } from "./ErrorMessage";

export type SelectCardGroupItemOption<V extends Value> = {
  icon: IconProps["icon"];
  label: string;
  /** Optional secondary copy shown beneath the label. */
  description?: string;
  disabled?: boolean;
  /** Tooltip shown on hover, i.e. to explain why the option is disabled. */
  tooltip?: string;
  /** The value of the SelectCardGroup item, stored in value array in state. */
  value: V;
  /** Exclusive: if true, this option will override all other options when selected. */
  exclusive?: boolean;
};

export type SelectCardGroupProps<V extends Value> = {
  label: string;
  /** Called when a card is selected */
  onChange: (values: V[]) => void;
  /** Options for the cards contained within the SelectCardGroup. */
  options: SelectCardGroupItemOption<V>[];
  /** The values currently selected. */
  values: V[];
  errorMsg?: string;
  helperText?: string | ReactNode;
  disabled?: boolean;
} & Pick<PresentationFieldProps, "labelStyle">;

export function SelectCardGroup<V extends Value>(props: SelectCardGroupProps<V>) {
  const { fieldProps } = usePresentationContext();
  const {
    options,
    label,
    labelStyle = fieldProps?.labelStyle ?? "above",
    values,
    errorMsg,
    helperText,
    disabled: isDisabled = false,
    onChange,
  } = props;

  const [selected, setSelected] = useState<V[]>(values);

  const exclusiveOptions = useMemo(() => options.filter((o) => o.exclusive), [options]);

  const toggleValue = useCallback(
    (value: V) => {
      if (isDisabled) return;

      const option = options.find((o) => o.value === value);
      if (!option) return;

      let newSelected: V[] = [];
      if (selected.includes(value)) {
        newSelected = selected.filter((v) => v !== value);
      } else {
        if (option.exclusive) {
          newSelected = [value];
        } else {
          newSelected = [...selected, value];

          // Filter out any exclusive options as a non-exclusive option was selected.
          newSelected = newSelected.filter((v) => !exclusiveOptions.some((o) => o.value === v));
        }
      }
      setSelected(newSelected);
      onChange(newSelected);
    },
    [exclusiveOptions, isDisabled, onChange, options, selected],
  );

  const tid = useTestIds(props);

  const { labelProps, fieldProps: fieldPropsAria } = useField(props);

  const groupProps = mergeProps(tid, {
    role: "group",
    "aria-disabled": isDisabled || undefined,
    ...fieldPropsAria,
  });

  return (
    <div {...groupProps}>
      {labelStyle !== "hidden" && (
        <div css={Css.if(labelStyle === "left").w50.$}>
          <Label label={label} {...labelProps} {...tid.label} />
        </div>
      )}
      <div css={Css.df.gap2.add("flexWrap", "wrap").$}>
        {options.map((option) => {
          const { icon, label, description, disabled, tooltip } = option;
          const isSelected = selected.includes(option.value);
          return (
            <SelectCard
              key={option.label}
              icon={icon}
              label={label}
              description={description}
              selected={isSelected}
              disabled={disabled}
              tooltip={tooltip}
              onChange={() => toggleValue(option.value)}
              {...tid[option.label]}
            />
          );
        })}
      </div>
      {errorMsg && <ErrorMessage errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </div>
  );
}
