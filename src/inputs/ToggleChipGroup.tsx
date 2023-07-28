import { ReactNode, useRef } from "react";
import { useCheckboxGroup, useCheckboxGroupItem, useFocusRing, VisuallyHidden } from "react-aria";
import { CheckboxGroupState, useCheckboxGroupState } from "react-stately";
import { maybeTooltip, resolveTooltip } from "src/components";
import { Label } from "src/components/Label";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ToggleChipItemProps = {
  label: string;
  value: string;
  /**
   * Whether the interactive element is disabled.
   *
   * If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip.
   */
  disabled?: boolean | ReactNode;
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
  const tid = useTestIds(props, "toggleChip");

  return (
    <div {...groupProps} css={Css.relative.$}>
      <Label label={label} {...labelProps} hidden={hideLabel} />
      <div css={Css.df.gap1.add("flexWrap", "wrap").$}>
        {options.map((o) => (
          <ToggleChip
            key={o.value}
            value={o.value}
            groupState={state}
            selected={state.value.includes(o.value)}
            label={o.label}
            disabled={o.disabled}
            {...tid[o.value]}
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
  /**
   * Whether the interactive element is disabled.
   *
   * If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip.
   */
  disabled?: boolean | ReactNode;
}

function ToggleChip(props: ToggleChipProps) {
  const { label, value, groupState, selected: isSelected, disabled = false, ...others } = props;
  const isDisabled = !!disabled;
  const ref = useRef(null);
  const { inputProps } = useCheckboxGroupItem({ value, "aria-label": label, isDisabled }, groupState, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const tooltip = resolveTooltip(disabled);

  return maybeTooltip({
    title: tooltip,
    placement: "top",
    children: (
      <label
        css={{
          ...Css.relative.dib.br16.sm.px1.cursorPointer.pyPx(4).bgGray200.if(isDisabled).cursorNotAllowed.gray600.pr1.$,
          ...(isSelected
            ? {
                ...Css.white.bgBlue700.$,
                ":hover:not([data-disabled='true'])": Css.bgBlue800.$,
              }
            : { ":hover:not([data-disabled='true'])": Css.bgGray300.$ }),
          ...(isFocusVisible ? Css.bshFocus.$ : {}),
        }}
        data-selected={isSelected}
        data-disabled={isDisabled}
        aria-disabled={isDisabled}
        {...others}
      >
        <VisuallyHidden>
          <input {...inputProps} {...focusProps} />
        </VisuallyHidden>
        {label}
      </label>
    ),
  });
}
