import React, {
  ChangeEvent,
  InputHTMLAttributes,
  Key,
  LabelHTMLAttributes,
  MutableRefObject,
  ReactNode,
  useState,
} from "react";
import { mergeProps } from "react-aria";
import { ComboBoxState } from "react-stately";
import { Chips, Icon, Tooltip } from "src/components";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { useGrowingTextField } from "src/inputs/hooks/useGrowingTextField";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { useTreeSelectFieldProvider } from "src/inputs/TreeSelectField/TreeSelectField";
import { isLeveledNode } from "src/inputs/TreeSelectField/utils";
import { Value } from "src/inputs/Value";
import { maybeCall } from "src/utils";

interface ComboBoxInputProps<O, V extends Value> extends PresentationFieldProps {
  buttonProps: any;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  listBoxRef?: MutableRefObject<HTMLDivElement | null>;
  state: ComboBoxState<O>;
  fieldDecoration?: (opt: O) => ReactNode;
  errorMsg?: string;
  required?: boolean;
  helperText?: string | ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
  selectedOptions: O[];
  selectedOptionsLabels?: string[];
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  sizeToContent?: boolean;
  contrast?: boolean;
  nothingSelectedText: string;
  tooltip?: ReactNode;
  resetField: VoidFunction;
  hideErrorMessage?: boolean;
  isTree?: boolean;
  /* Allows input to wrap to multiple lines */
  multiline?: boolean;
}

export function ComboBoxInput<O, V extends Value>(props: ComboBoxInputProps<O, V>) {
  const {
    inputProps,
    buttonProps,
    buttonRef,
    errorMsg,
    state,
    fieldDecoration,
    onBlur,
    onFocus,
    selectedOptions,
    selectedOptionsLabels,
    getOptionValue,
    getOptionLabel,
    sizeToContent = false,
    contrast = false,
    nothingSelectedText,
    resetField,
    isTree,
    listBoxRef,
    inputRef,
    inputWrapRef,
    multiline = false,
    ...otherProps
  } = props;

  const { wrap = false } = usePresentationContext();

  // Allow the field to wrap whether the caller has explicitly set `multiline=true` or the `PresentationContext.wrap=true`
  const allowWrap = wrap || multiline;
  const { collapsedKeys, setCollapsedKeys } = useTreeSelectFieldProvider();

  const [isFocused, setIsFocused] = useState(false);
  const isMultiSelect = state.selectionManager.selectionMode === "multiple";
  const showNumSelection = isMultiSelect && state.selectionManager.selectedKeys.size > 1;
  // Show selections as chips when using multiselect when unfocused
  const showChipSelection = isMultiSelect && state.selectionManager.selectedKeys.size > 0;
  // For MultiSelect only show the `fieldDecoration` when input is not in focus.
  const showFieldDecoration =
    (!isMultiSelect || (isMultiSelect && !isFocused)) && fieldDecoration && selectedOptions.length === 1;

  const multilineProps = allowWrap ? { textAreaMinHeight: 0, multiline: true } : {};

  const chipLabels = isTree ? selectedOptionsLabels || [] : selectedOptions.map((o) => getOptionLabel(o));

  useGrowingTextField({
    // This says: When using a multiselect, then only enable the growing textfield when we are focused on it.
    // Because otherwise, we're not displaying the input element that dictates the height (we're displaying <Chips/>). This would cause incorrect calculations
    disabled: (isMultiSelect && (!allowWrap || !isFocused)) || (!isMultiSelect && !allowWrap),
    inputRef,
    inputWrapRef,
    value: inputProps.value,
  });

  return (
    <TextFieldBase
      {...otherProps}
      {...multilineProps}
      unfocusedPlaceholder={
        showChipSelection && <Chips compact={otherProps.compact} values={chipLabels} wrap={allowWrap} />
      }
      inputRef={inputRef}
      inputWrapRef={inputWrapRef}
      errorMsg={errorMsg}
      contrast={contrast}
      xss={otherProps.labelStyle !== "inline" && !inputProps.readOnly ? Css.fw5.$ : {}}
      startAdornment={
        (showNumSelection && (
          <Tooltip title={<SelectedOptionBullets labels={chipLabels} />}>
            <span
              css={Css.wPx(16).hPx(16).fs0.br100.bgBlue700.white.tinySb.df.aic.jcc.$}
              data-testid="selectedOptionsCount"
            >
              {isTree ? selectedOptionsLabels?.length : state.selectionManager.selectedKeys.size}
            </span>
          </Tooltip>
        )) ||
        (showFieldDecoration && fieldDecoration(selectedOptions[0]))
      }
      endAdornment={
        !inputProps.readOnly && (
          <button
            {...buttonProps}
            disabled={inputProps.disabled}
            ref={buttonRef}
            css={{
              ...Css.br4.outline0.gray700.if(contrast).gray400.$,
              ...(inputProps.disabled ? Css.cursorNotAllowed.gray400.if(contrast).gray600.$ : {}),
            }}
            data-testid="toggleListBox"
          >
            <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />
          </button>
        )
      }
      inputProps={{
        ...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg), onInput: () => state.open() }),
        // Not merging the following as we want them to overwrite existing events
        ...{
          onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
            // We need to do some custom logic when using MultiSelect, as react-aria/stately Combobox doesn't support multiselect out of the box.
            if (isMultiSelect) {
              if (isTree) {
                const item = state.collection.getItem(state.selectionManager.focusedKey);
                if (item && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
                  if (!isLeveledNode(item)) return;
                  const leveledOption = item.value;

                  if (!leveledOption) return;
                  const [option] = leveledOption;

                  e.stopPropagation();
                  e.preventDefault();
                  if (option && option.children && option.children.length > 0) {
                    if (collapsedKeys.includes(item.key) && e.key === "ArrowRight") {
                      setCollapsedKeys((prevKeys: Key[]) => prevKeys.filter((k) => k !== item.key));
                    } else if (!collapsedKeys.includes(item.key) && e.key === "ArrowLeft") {
                      setCollapsedKeys((prevKeys: Key[]) => [...prevKeys, item.key]);
                    }
                  }
                  return;
                }
              }

              // Enter should toggle the focused item.
              if (e.key === "Enter") {
                // Prevent form submissions if menu is open.
                if (state.isOpen) {
                  e.preventDefault();
                }

                state.selectionManager.toggleSelection(state.selectionManager.focusedKey);
                return;
              }

              // By default, the Escape key would "revert" changes,
              // but we just want to close the menu and leave the reset of the field state as is.
              if (e.key === "Escape") {
                state.close();
                return;
              }
            }

            // Handle single selection Escape key press
            // When a user hits `Escape`, then react-aria calls `state.revert`, which uses `state.selectedKey` to
            // reset the field to its previous value. However, because we use a the Multiple Selection State manager,
            // then our `state.selectedKey` isn't set. So we need to properly reset the state ourselves.
            if (e.key === "Escape") {
              state.close();
              resetField();
              return;
            }

            inputProps.onKeyDown && inputProps.onKeyDown(e);
          },
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            // Prevent user from entering any content that has new line characters.
            const target = e.target as unknown as HTMLTextAreaElement;
            target.value = target.value.replace(/[\n\r]/g, "");
            // Call existing onChange handler if any.
            inputProps.onChange && inputProps.onChange(e);
          },
          onBlur: (e: React.FocusEvent) => {
            // Do not call onBlur if readOnly or interacting within the input wrapper (such as the menu trigger button), or anything within the listbox.
            if (
              inputProps.readOnly ||
              (props.inputWrapRef.current && props.inputWrapRef.current.contains(e.relatedTarget as HTMLElement)) ||
              (props.listBoxRef?.current && props.listBoxRef.current.contains(e.relatedTarget as HTMLElement))
            ) {
              return;
            }

            // We purposefully override onBlur here instead of using mergeProps, b/c inputProps.onBlur
            // goes into useComboBox's onBlur, which calls setFocused(false), which in useComboBoxState
            // detects a) there is no props.selectedKey (b/c we don't pass it), and b) there is an
            // `inputValue`, so it thinks it needs to call `resetInputValue()`.
            setIsFocused(false);
            maybeCall(onBlur);
            state.close();

            // Always call `resetField` onBlur, this ensures the field's `input.value` resets
            // to what it should be in case it doesn't currently match.
            resetField();
          },
          onFocus: () => {
            if (inputProps.readOnly) return;
            setIsFocused(true);
            maybeCall(onFocus);
          },
          onClick: () => {
            if (inputProps.readOnly) return;
            buttonRef.current?.click();
          },
          size:
            // If sizeToContent, then, in order of precedence, base it of from:
            // 1. input's value if any
            // 2. If is MultiSelect and only one option is chosen, then use the length of that option to define the width to avoid size jumping on blur.
            // 3. Use `nothingSelectedText`
            // 4. Default to "1"
            // And do not allow it to grow past a size of 20.
            // TODO: Combine logic to determine the input's value. Similar logic is used in ComboBoxBase, though it is intertwined with other state logic. Such as when to open/close menu, or filter the options within that menu, etc...
            sizeToContent
              ? Math.min(
                  String(
                    inputProps.value ||
                      (isMultiSelect && selectedOptions.length === 1 && getOptionLabel(selectedOptions[0])) ||
                      nothingSelectedText ||
                      "",
                  ).length || 1,
                  20,
                )
              : undefined,
        },
      }}
    />
  );
}

function SelectedOptionBullets({ labels = [] }: { labels: string[] | undefined }) {
  return <div>{labels?.map((label) => <li key={label}>{label}</li>)}</div>;
}
