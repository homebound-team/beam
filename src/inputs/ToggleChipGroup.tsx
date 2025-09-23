import { ReactNode, useRef } from "react";
import { useCheckboxGroup, useCheckboxGroupItem, useFocusRing, VisuallyHidden } from "react-aria";
import { CheckboxGroupState, useCheckboxGroupState } from "react-stately";
import { maybeTooltip, resolveTooltip } from "src/components";
import { Label } from "src/components/Label";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css, Palette, Xss } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { useTestIds } from "src/utils/useTestIds";

type ToggleChipXss = Xss<"color" | "backgroundColor">;

type ToggleChipItemProps = {
  label: string;
  value: string;
  startAdornment?: ReactNode;
  /**
   * Whether the interactive element is disabled.
   *
   * If a ReactNode, it's treated as a "disabled reason" that's shown in a tooltip.
   */
  disabled?: boolean | ReactNode;
  readonly?: boolean;
};

export interface ToggleChipGroupProps extends Pick<PresentationFieldProps, "labelStyle"> {
  label: string;
  options: ToggleChipItemProps[];
  values: string[];
  readonly?: boolean;
  required?: boolean;
  onChange: (values: string[]) => void;
  xss?: ToggleChipXss;
}

export function ToggleChipGroup(props: ToggleChipGroupProps) {
  const { fieldProps } = usePresentationContext();
  const { labelLeftFieldWidth = "50%" } = fieldProps ?? {};
  const {
    values,
    label,
    labelStyle = fieldProps?.labelStyle ?? "above",
    options,
    required,
    xss,
    readonly = false,
  } = props;
  const state = useCheckboxGroupState({ ...props, isReadOnly: readonly, value: values });
  const { groupProps, labelProps } = useCheckboxGroup(props, state);
  const tid = useTestIds(props, "toggleChip");
  const labelSuffix = useLabelSuffix(required, false);

  return (
    <div {...groupProps} css={Css.relative.df.fdc.if(labelStyle === "left").fdr.gap2.maxw100.jcsb.$}>
      <Label
        label={label}
        {...labelProps}
        hidden={labelStyle === "hidden"}
        inline={labelStyle !== "above"}
        suffix={labelSuffix}
      />
      <div
        css={
          Css.df.gap1
            .add("flexWrap", "wrap")
            .if(labelStyle === "left")
            .w(labelLeftFieldWidth).$
        }
      >
        {options.map((o) => (
          <ToggleChip
            key={o.value}
            value={o.value}
            groupState={state}
            selected={state.value.includes(o.value)}
            label={o.label}
            disabled={o.disabled}
            readonly={o.readonly}
            startAdornment={o.startAdornment}
            xss={xss}
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
  readonly?: boolean;
  startAdornment?: ReactNode;
  xss?: ToggleChipXss;
}

function ToggleChip(props: ToggleChipProps) {
  const {
    label,
    value,
    groupState,
    selected: isSelected,
    disabled = false,
    readonly = false,
    startAdornment,
    xss,
    ...others
  } = props;
  const isDisabled = !!disabled;
  const isReadOnly = !!readonly;
  const ref = useRef(null);
  const { inputProps } = useCheckboxGroupItem({ value, "aria-label": label, isReadOnly, isDisabled }, groupState, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const tooltip = resolveTooltip(disabled);

  return maybeTooltip({
    title: tooltip,
    placement: "top",
    children: (
      <label
        css={{
          ...Css.relative.dif.gap1.aic.br16.sm.px1.cursorPointer.pyPx(4).bgGray200.if(isDisabled).cursorNotAllowed
            .gray600.pr1.$,
          ...(isSelected
            ? {
                ...Css.color(xss?.color ?? Palette.White).bgColor(xss?.backgroundColor ?? Palette.Blue700).$,
                ":hover:not([data-disabled='true'])": Css.bgColor(xss?.backgroundColor ?? Palette.Blue800).$,
              }
            : { ":hover:not([data-disabled='true'])": Css.if(!groupState.isReadOnly).bgGray300.$ }),
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
        {startAdornment}
        {label}
      </label>
    ),
  });
}
