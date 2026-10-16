import type { DOMAttributes } from "@react-types/shared";
import type { JSX, KeyboardEvent, RefObject } from "react";
import { mergeProps } from "react-aria";
import { CountBadge } from "src/components/CountBadge";
import { HelperText } from "src/components/HelperText";
import { Icon } from "src/components/Icon";
import { Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { OriginalValue, ProposedValue } from "src/components/ProposedValue";
import { BorderHoverChild } from "src/components/Table/components/Row";
import { maybeTooltip, resolveTooltip, Tooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getFieldChrome, selectedValueCss } from "src/inputs/fieldChrome";
import type { AiProposalProps } from "src/inputs/hooks/useAiProposal";
import type { MenuSelectFieldBaseProps } from "src/inputs/MenuSelectField/types";
import type { Value } from "src/inputs/Value";
import type { TextFieldInternalProps } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

/** Runtime state for the closed field: its button, label, and value. */
export type MenuSelectTriggerState = {
  isDisabled: boolean;
  isReadOnly: boolean;
  isOpen: boolean;
  listId: string;
  triggerId: string;
  labelId: string;
  valueId: string;
  errorId: string;
  hoverProps: DOMAttributes<HTMLButtonElement>;
  focusProps: DOMAttributes<HTMLButtonElement>;
  isFocusVisible: boolean;
  isHovered: boolean;
  open: () => void;
  close: (opts: { restoreFocus: boolean }) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  displayText: string;
  isPlaceholder: boolean;
  /** Selected option labels for the multi-select count badge. Empty for a single select. */
  selectedLabels: { key: string; label: string }[];
  proposalProps: AiProposalProps;
};

type MenuSelectTriggerProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  trigger: MenuSelectTriggerState;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

/** Label, value, and field chrome for a menu select. The menu itself is rendered by the parent. */
export function MenuSelectTrigger<O, V extends Value>(props: MenuSelectTriggerProps<O, V>): JSX.Element {
  const {
    label,
    required,
    errorMsg,
    helperText,
    disabled,
    readOnly,
    labelStyle: labelStyleProp,
    inputStylePalette,
    trigger,
    triggerRef,
  } = props;
  const internalProps: TextFieldInternalProps = (props as any).internalProps ?? {};
  const { compound = false, forceFocus = false, forceHover = false } = internalProps;
  const tid = useTestIds(props, defaultTestId(label));
  const { fieldProps } = usePresentationContext();
  const labelStyle = labelStyleProp ?? fieldProps?.labelStyle ?? "above";
  const compact = props.compact ?? fieldProps?.compact ?? false;
  const borderless = props.borderless ?? fieldProps?.borderless ?? false;
  const borderOnHover = props.borderOnHover ?? fieldProps?.borderOnHover ?? false;
  const fullWidth = props.fullWidth ?? fieldProps?.fullWidth ?? false;
  const visuallyDisabled = props.visuallyDisabled ?? fieldProps?.visuallyDisabled ?? true;
  const errorInTooltip = props.errorInTooltip ?? fieldProps?.errorInTooltip ?? false;
  const typeScale = fieldProps?.typeScale ?? "sm";
  const labelSuffix = useLabelSuffix(required, trigger.isReadOnly);

  const showFocus =
    ((trigger.isFocusVisible || trigger.isOpen) && !trigger.isDisabled && !trigger.isReadOnly) || forceFocus;
  const showHover = (trigger.isHovered && !trigger.isDisabled && !trigger.isReadOnly && !showFocus) || forceHover;
  // A compound field draws the box and owns anything below the control.
  const showErrorAndHelper = !compound && !trigger.isDisabled && !trigger.isReadOnly;
  const { proposedValue: proposedText, originalValue: originalText } = trigger.proposalProps;
  const showProposal = proposedText !== undefined;
  // Read-only draws both halves inline; editable fields strike the original through below.
  const originalBelow = originalText && !trigger.isReadOnly ? originalText : undefined;
  const fieldChrome = getFieldChrome({
    typeScale,
    labelStyle,
    labelLeftFieldWidth: fieldProps?.labelLeftFieldWidth,
    compact,
    borderless,
    borderOnHover,
    fullWidth,
    compound,
    visuallyDisabled,
    isHovered: trigger.isHovered || forceHover,
    showProposal,
    inputStylePalette,
  });
  const fieldStateCss = {
    ...fieldChrome.control,
    ...(trigger.isDisabled ? fieldChrome.disabled : {}),
    ...(showFocus ? fieldChrome.focus : {}),
    ...(showHover ? fieldChrome.hover : {}),
    ...(errorMsg && !trigger.isDisabled ? fieldChrome.error : {}),
    ...Css.tal.outline0.add("appearance", "none").add("font", "inherit").if(!trigger.isDisabled).cursorPointer.$,
  };

  // Outside `showErrorAndHelper`, because a disabled field still shows what it's replacing.
  const supporting = (
    <>
      {originalBelow && <OriginalValue originalValue={originalBelow} {...tid.originalValue} />}
      {showErrorAndHelper && errorMsg && !errorInTooltip && (
        <ErrorMessage id={trigger.errorId} errorMsg={errorMsg} {...tid.errorMsg} />
      )}
      {showErrorAndHelper && helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </>
  );
  const hasSupporting = !!(originalBelow || (showErrorAndHelper && (errorMsg || helperText)));

  const valueNode = (
    <>
      {labelStyle === "inline" && (
        <span
          id={trigger.labelId}
          css={Css.sm.wsnw.prPx(4).color(trigger.isDisabled && visuallyDisabled ? "currentColor" : Tokens.TextLabel).$}
        >
          {label}:
        </span>
      )}
      <span id={trigger.valueId} css={Css.df.aic.fg1.mw0.oh.$}>
        {trigger.isReadOnly && showProposal ? (
          <span css={Css.fg1.truncate.$}>
            <ProposedValue original={originalText} proposed={proposedText} {...tid.proposedValue} />
          </span>
        ) : (
          <>
            {trigger.selectedLabels.length > 0 && (
              <Tooltip title={<SelectedLabels labels={trigger.selectedLabels} />}>
                <span css={Css.df.aic.fs0.mr1.$}>
                  <CountBadge count={trigger.selectedLabels.length} {...tid.count} />
                </span>
              </Tooltip>
            )}
            <span
              css={{
                ...Css.fg1.truncate.color(trigger.isPlaceholder ? inputPlaceholderColor : undefined).$,
                // A placeholder reads as hint text, so it stays at the field's regular weight.
                ...(!trigger.isPlaceholder ? selectedValueCss(labelStyle, trigger.isReadOnly) : {}),
                ...(showProposal ? Css.fw6.color(Tokens.AiFieldFg).$ : {}),
              }}
            >
              {trigger.displayText}
            </span>
          </>
        )}
      </span>
      {errorInTooltip && errorMsg && showErrorAndHelper && (
        <span css={Css.df.aic.fs0.pl1.$}>
          <Icon icon="error" color={Tokens.Danger} tooltip={errorMsg} />
        </span>
      )}
      {!trigger.isReadOnly && (
        <span
          css={Css.df.aic.fs0.pl1.color(trigger.isDisabled ? Tokens.FieldTextDisabled : Tokens.TextPlaceholder).$}
          {...tid.toggle}
        >
          <Icon icon={trigger.isOpen ? "chevronUp" : "chevronDown"} />
        </span>
      )}
    </>
  );

  return (
    <>
      <div css={fieldChrome.container}>
        {label && labelStyle !== "inline" && (
          <Label
            labelProps={{
              id: trigger.labelId,
              htmlFor: trigger.isReadOnly ? undefined : trigger.triggerId,
              onClick: (event) => {
                // A native label click would also activate the button and toggle the menu shut.
                event.preventDefault();
                if (trigger.isDisabled || trigger.isReadOnly || trigger.isOpen) return;
                triggerRef.current?.focus();
                trigger.open();
              },
            }}
            hidden={labelStyle === "hidden"}
            label={label}
            inline={labelStyle === "left"}
            suffix={labelSuffix}
            {...tid.label}
          />
        )}
        {maybeTooltip({
          title: resolveTooltip(disabled, undefined, readOnly),
          placement: "top",
          children: trigger.isReadOnly ? (
            <div
              css={fieldChrome.readOnly}
              data-readonly="true"
              data-ai-mode={showProposal ? "true" : undefined}
              {...tid}
            >
              {valueNode}
            </div>
          ) : (
            <button
              {...mergeProps(trigger.hoverProps, trigger.focusProps, {
                id: trigger.triggerId,
                type: "button" as const,
                disabled: trigger.isDisabled,
                "aria-haspopup": "listbox" as const,
                "aria-expanded": trigger.isOpen,
                "aria-controls": trigger.listId,
                "aria-labelledby": `${trigger.labelId} ${trigger.valueId}`,
                "aria-invalid": errorMsg ? true : undefined,
                "aria-errormessage": errorMsg ? trigger.errorId : undefined,
                "data-ai-mode": showProposal ? "true" : undefined,
                onKeyDown: trigger.onKeyDown,
                onClick: () => (trigger.isOpen ? trigger.close({ restoreFocus: true }) : trigger.open()),
                onFocus: trigger.onFocus,
                onBlur: trigger.onBlur,
              })}
              ref={triggerRef}
              className={BorderHoverChild}
              css={fieldStateCss}
              {...tid}
            >
              {valueNode}
            </button>
          ),
        })}
        {labelStyle !== "left" && supporting}
      </div>
      {labelStyle === "left" && hasSupporting && <div css={Css.mtPx(-8).ml("50%").$}>{supporting}</div>}
    </>
  );
}

/**
 * Same gray as `input::placeholder` in `CssReset.css`. The placeholder here is a span, so that rule never reaches it.
 * TODO: Move this to tokens. https://linear.app/homebound-team/issue/DS-395/update-placeholder-text-color-to-use-color-tokens
 */
const inputPlaceholderColor = "#9ca3af";

function SelectedLabels({ labels }: { labels: { key: string; label: string }[] }) {
  return (
    <ul css={Css.m0.pl2.$}>
      {labels.map(({ key, label }) => (
        <li key={key}>{label}</li>
      ))}
    </ul>
  );
}
