import { useRef } from "react";
import { useCheckboxGroup, useCheckboxGroupItem, useFocusRing, VisuallyHidden } from "react-aria";
import { CheckboxGroupState, useCheckboxGroupState } from "react-stately";
import { Label } from "src/components/Label";
import { Css } from "src/Css";

type ToggleChipItemProps = {
  label: string;
  value: string;
};

export interface ToggleChipGroupProps {
  label: string;
  options: ToggleChipItemProps[];
  values: string[];
  onChange: (values: string[]) => void;
  hideLabel?: boolean;
}

export function ToggleChipGroup(props: ToggleChipGroupProps) {
  const { values, label, options, hideLabel } = props;
  const state = useCheckboxGroupState({ ...props, value: values });
  const { groupProps, labelProps } = useCheckboxGroup(props, state);

  return (
    <div {...groupProps} css={Css.relative.$}>
      <Label label={label} {...labelProps} hidden={hideLabel} />
      <div>
        {options.map((o) => (
          <ToggleChip
            key={o.value}
            value={o.value}
            groupState={state}
            selected={state.value.includes(o.value)}
            label={o.label}
          />
        ))}
      </div>
    </div>
  );
}

interface ToggleChipProps {
  label: string;
  value: string;
  groupState: CheckboxGroupState;
  selected: boolean;
}

function ToggleChip(props: ToggleChipProps) {
  const { label, value, groupState, selected: isSelected } = props;
  const ref = useRef(null);
  const { inputProps } = useCheckboxGroupItem({ value, "aria-label": label }, groupState, ref);
  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <label
      css={{
        ...Css.relative.dib.br16.sm.px1.cursorPointer.pyPx(4).mr1.mb1.bgGray200.$,
        ...(isSelected
          ? {
              ...Css.white.bgLightBlue700.$,
              ":hover": Css.bgLightBlue800.$,
            }
          : { ":hover": Css.bgGray300.$ }),
        ...(isFocusVisible ? Css.bshFocus.$ : {}),
      }}
    >
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} />
      </VisuallyHidden>
      {label}
    </label>
  );
}
