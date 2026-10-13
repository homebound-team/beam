import type { JSX, RefObject } from "react";
import { mergeProps } from "react-aria";
import { HelperText } from "src/components/HelperText";
import { Icon } from "src/components/Icon";
import { Label } from "src/components/Label";
import { usePresentationContext } from "src/components/PresentationContext";
import { OriginalValue, ProposedValue } from "src/components/ProposedValue";
import { BorderHoverChild } from "src/components/Table/components/Row";
import { maybeTooltip, resolveTooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getFieldChrome, selectedValueCss } from "src/inputs/fieldChrome";
import type {
  MenuSelectController,
  MenuSelectControllerProps,
} from "src/inputs/MenuSelectField/internal/useMenuSelectController";
import type { Value } from "src/inputs/Value";
import type { TextFieldInternalProps } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

type MenuSelectTriggerProps<O, V extends Value> = MenuSelectControllerProps<O, V> & {
  menu: MenuSelectController<O, V>;
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
    menu,
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
  const labelSuffix = useLabelSuffix(required, menu.isReadOnly);

  const showFocus = ((menu.isFocusVisible || menu.isOpen) && !menu.isDisabled && !menu.isReadOnly) || forceFocus;
  const showHover = (menu.isHovered && !menu.isDisabled && !menu.isReadOnly && !showFocus) || forceHover;
  // A compound field draws the box and owns anything below the control.
  const showErrorAndHelper = !compound && !menu.isDisabled && !menu.isReadOnly;
  const { proposedValue: proposedText, originalValue: originalText } = menu.proposalProps;
  const showProposal = proposedText !== undefined;
  // Read-only draws both halves inline; editable fields strike the original through below.
  const originalBelow = originalText && !menu.isReadOnly ? originalText : undefined;
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
    isHovered: menu.isHovered || forceHover,
    showProposal,
    inputStylePalette,
  });
  const fieldStateCss = {
    ...fieldChrome.control,
    ...(menu.isDisabled ? fieldChrome.disabled : {}),
    ...(showFocus ? fieldChrome.focus : {}),
    ...(showHover ? fieldChrome.hover : {}),
    ...(errorMsg && !menu.isDisabled ? fieldChrome.error : {}),
    ...Css.tal.outline0.add("appearance", "none").add("font", "inherit").if(!menu.isDisabled).cursorPointer.$,
  };

  // Outside `showErrorAndHelper`, because a disabled field still shows what it's replacing.
  const supporting = (
    <>
      {originalBelow && <OriginalValue originalValue={originalBelow} {...tid.originalValue} />}
      {showErrorAndHelper && errorMsg && !errorInTooltip && (
        <ErrorMessage id={menu.errorId} errorMsg={errorMsg} {...tid.errorMsg} />
      )}
      {showErrorAndHelper && helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </>
  );
  const hasSupporting = !!(originalBelow || (showErrorAndHelper && (errorMsg || helperText)));

  const valueNode = (
    <>
      {labelStyle === "inline" && (
        <span
          id={menu.labelId}
          css={Css.sm.wsnw.prPx(4).color(menu.isDisabled && visuallyDisabled ? "currentColor" : Tokens.TextLabel).$}
        >
          {label}:
        </span>
      )}
      <span id={menu.valueId} css={Css.df.aic.fg1.mw0.oh.$}>
        {menu.isReadOnly && showProposal ? (
          <span css={Css.fg1.truncate.$}>
            <ProposedValue original={originalText} proposed={proposedText} {...tid.proposedValue} />
          </span>
        ) : (
          <span
            css={{
              ...Css.fg1.truncate.color(menu.isPlaceholder ? inputPlaceholderColor : undefined).$,
              // A placeholder reads as hint text, so it stays at the field's regular weight.
              ...(!menu.isPlaceholder ? selectedValueCss(labelStyle, menu.isReadOnly) : {}),
              ...(showProposal ? Css.fw6.color(Tokens.AiFieldFg).$ : {}),
            }}
          >
            {menu.displayText}
          </span>
        )}
      </span>
      {errorInTooltip && errorMsg && showErrorAndHelper && (
        <span css={Css.df.aic.fs0.pl1.$}>
          <Icon icon="error" color={Tokens.Danger} tooltip={errorMsg} />
        </span>
      )}
      {!menu.isReadOnly && (
        <span
          css={Css.df.aic.fs0.pl1.color(menu.isDisabled ? Tokens.FieldTextDisabled : Tokens.TextPlaceholder).$}
          {...tid.toggle}
        >
          <Icon icon={menu.isOpen ? "chevronUp" : "chevronDown"} />
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
              id: menu.labelId,
              htmlFor: menu.isReadOnly ? undefined : menu.triggerId,
              onClick: (event) => {
                // A native label click would also activate the button and toggle the menu shut.
                event.preventDefault();
                if (menu.isDisabled || menu.isReadOnly || menu.isOpen) return;
                triggerRef.current?.focus();
                menu.open();
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
          children: menu.isReadOnly ? (
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
              {...mergeProps(menu.hoverProps, menu.focusProps, {
                id: menu.triggerId,
                type: "button" as const,
                disabled: menu.isDisabled,
                "aria-haspopup": "listbox" as const,
                "aria-expanded": menu.isOpen,
                "aria-controls": menu.listId,
                "aria-labelledby": `${menu.labelId} ${menu.valueId}`,
                "aria-invalid": errorMsg ? true : undefined,
                "aria-errormessage": errorMsg ? menu.errorId : undefined,
                "data-ai-mode": showProposal ? "true" : undefined,
                onKeyDown: menu.onTriggerKeyDown,
                onClick: () => (menu.isOpen ? menu.close({ restoreFocus: true }) : menu.open()),
                onFocus: menu.onTriggerFocus,
                onBlur: menu.onTriggerBlur,
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
