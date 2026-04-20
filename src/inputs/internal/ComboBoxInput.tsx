import { Key as AriaKey } from "@react-types/shared";
import React, {
  ChangeEvent,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  MutableRefObject,
  ReactNode,
  useState,
} from "react";
import { mergeProps } from "react-aria";
import { ComboBoxState } from "react-stately";
import { Chips, CountBadge, Icon, Tooltip } from "src/components";
import { PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { Css } from "src/Css";
import { useGrowingTextField } from "src/inputs/hooks/useGrowingTextField";
import { TextFieldBase } from "src/inputs/TextFieldBase";
import { useTreeSelectFieldProvider } from "src/inputs/TreeSelectField/TreeSelectField";
import { isLeveledNode } from "src/inputs/TreeSelectField/utils";
import { Value } from "src/inputs/Value";
import { maybeCall } from "src/utils";

type ComboBoxInputProps<O, V extends Value> = {
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
} & PresentationFieldProps;

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
  // Show selections as chips when using multiselect when unfocused
  const showChipSelection = isMultiSelect && state.selectionManager.selectedKeys.size > 0;
  // For MultiSelect only show the `fieldDecoration` when input is not in focus.
  const showFieldDecoration =
    (!isMultiSelect || (isMultiSelect && !isFocused)) && fieldDecoration && selectedOptions.length === 1;

  const multilineProps = allowWrap ? { textAreaMinHeight: 0, multiline: true } : {};

  const chipLabels = isTree ? selectedOptionsLabels || [] : selectedOptions.map((o) => getOptionLabel(o));
  const selectedChipCount = chipLabels.length;
  const showNumSelection = isMultiSelect && selectedChipCount > 1;

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
      xss={otherProps.labelStyle !== "inline" && !inputProps.readOnly ? Css.fw5.$ : undefined}
      startAdornment={
        (showNumSelection && (
          <Tooltip title={<SelectedOptionBullets labels={chipLabels} />}>
            <CountBadge count={selectedChipCount} data-testid="selectedOptionsCount" />
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
            // Tree-specific: ArrowLeft/ArrowRight to collapse/expand nodes
            if (isMultiSelect && isTree) {
              const focusedKey = state.selectionManager.focusedKey;
              if (focusedKey == null) return;
              const item = state.collection.getItem(focusedKey);
              if (item && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
                if (!isLeveledNode(item)) return;
                const leveledOption = item.value;

                if (!leveledOption) return;
                const [option] = leveledOption;

                e.stopPropagation();
                e.preventDefault();
                if (option && option.children && option.children.length > 0) {
                  if (collapsedKeys.includes(item.key) && e.key === "ArrowRight") {
                    setCollapsedKeys((prevKeys: AriaKey[]) => prevKeys.filter((k) => k !== item.key));
                  } else if (!collapsedKeys.includes(item.key) && e.key === "ArrowLeft") {
                    setCollapsedKeys((prevKeys: AriaKey[]) => [...prevKeys, item.key]);
                  }
                }
                return;
              }
            }

            // Prevent form submissions when the menu is open and Enter is pressed.
            if (e.key === "Enter" && state.isOpen) {
              e.preventDefault();
            }

            // For multi-select Tab, don't pass to native handler. The native handler calls
            // state.commit() → selectionManager.select(focusedKey) which toggles the focused
            // item's selection, inadvertently deselecting it on Tab-out.
            // Let the browser handle Tab navigation naturally; our onBlur handles menu close.
            if (isMultiSelect && e.key === "Tab") {
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

            setIsFocused(false);
            maybeCall(onBlur);
            state.setFocused(false);

            // For multi-select, we use shouldCloseOnBlur: false to prevent `commitValue` from
            // calling onChange with stale data. So we close the menu manually via toggle.
            if (isMultiSelect && state.isOpen) {
              state.toggle();
            }

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
  return (
    <div>
      {labels?.map((label) => (
        <li key={label}>{label}</li>
      ))}
    </div>
  );
}
