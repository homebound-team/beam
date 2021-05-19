import { useComboBox } from "@react-aria/combobox";
import { useFilter } from "@react-aria/i18n";
import { mergeProps } from "@react-aria/utils";
import { Item } from "@react-stately/collections";
import { ComboBoxState, useComboBoxState } from "@react-stately/combobox";
import { CollectionChildren, Node } from "@react-types/shared";
import React, { Fragment, InputHTMLAttributes, Key, MutableRefObject, ReactNode, useRef, useState } from "react";
import {
  OverlayContainer,
  useButton,
  useFocusRing,
  useHover,
  useListBox,
  useOption,
  useOverlay,
  useOverlayPosition,
} from "react-aria";
import { ErrorMessage } from "src/components/ErrorMessage";
import { HelperText } from "src/components/HelperText";
import { Icon } from "src/components/Icon";
import { Label } from "src/components/Label";
import { Css, Palette, px } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";
import { useTestIds } from "src/utils/useTestIds";

export interface SelectFieldProps<O extends object, V extends Key> extends BeamSelectFieldBaseProps<O> {
  /** Renders `opt` in the dropdown menu, defaults to the `getOptionLabel` prop. */
  getOptionMenuLabel?: (opt: O) => string | ReactNode;
  getOptionValue: (opt: O) => V;
  getOptionLabel: (opt: O) => string;
  /** The current value; it can be `undefined`, even if `V` cannot be. */
  value: V | undefined;
  onSelect: (value: V, opt: O) => void;
  options: O[];
  // Should go in BeamFocusableProps?
  onBlur?: () => void;
}

export type HasIdAndName<V> = { id: V; name: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

/**
 * Provides a non-native select/dropdown widget.
 *
 * The `O` type is a list of options to show, the `V` is the primitive value of a
 * given `O` (i.e. it's id) that you want to use as the current/selected value.
 *
 * Note that the `O extends object` and `V extends Key` constraints come from react-aria,
 * and so we cannot easily change them.
 */
export function SelectField<O extends object, V extends Key>(props: SelectFieldProps<O, V>): JSX.Element;
export function SelectField<O extends HasIdAndName<V>, V extends Key>(
  props: Optional<SelectFieldProps<O, V>, "getOptionValue" | "getOptionLabel">,
): JSX.Element;
export function SelectField<O extends object, V extends Key>(
  props: Optional<SelectFieldProps<O, V>, "getOptionLabel" | "getOptionValue">,
): JSX.Element {
  const {
    getOptionValue = (opt: O) => (opt as any).id, // if unset, assume O implements HasId
    getOptionLabel = (opt: O) => (opt as any).name, // if unset, assume O implements HasName
    getOptionMenuLabel = getOptionLabel,
    onSelect,
    options,
    value,
    ...beamSelectFieldProps
  } = props;

  const { contains } = useFilter({ sensitivity: "base" });

  // Use the current value to find the option
  const selectedOption = options.find((opt) => getOptionValue(opt) === value);

  const [fieldState, setFieldState] = useState<{
    isOpen: boolean;
    selectedKey: V | undefined;
    inputValue: string;
    filteredOptions: O[];
  }>({
    isOpen: false,
    selectedKey: value,
    inputValue: selectedOption ? getOptionLabel(selectedOption) : "",
    filteredOptions: options,
  });

  return (
    <ComboBox<O>
      {...beamSelectFieldProps}
      filteredOptions={fieldState.filteredOptions}
      inputValue={fieldState.inputValue}
      selectedKey={fieldState.selectedKey}
      onSelectionChange={(key) => {
        // Even though the key is number|string, this will always be a string
        const newOption = options.find((o) => String(getOptionValue(o)) === key);
        setFieldState({
          isOpen: false,
          inputValue: newOption ? getOptionLabel(newOption) : "",
          selectedKey: key as V,
          filteredOptions: options,
        });
        onSelect && newOption && onSelect(getOptionValue(newOption), newOption);
      }}
      onInputChange={(value) => {
        setFieldState((prevState) => ({
          isOpen: true,
          inputValue: value,
          selectedKey: prevState.selectedKey,
          filteredOptions: options.filter((o) => contains(getOptionLabel(o), value)),
        }));
      }}
      onOpenChange={(isOpen) => {
        setFieldState((prevState) => ({
          isOpen,
          inputValue: prevState.inputValue,
          selectedKey: prevState.selectedKey,
          filteredOptions: prevState.filteredOptions,
        }));
      }}
    >
      {(item) => (
        <Item key={getOptionValue(item)} textValue={getOptionLabel(item)}>
          {getOptionMenuLabel(item)}
        </Item>
      )}
    </ComboBox>
  );
}

interface ComboBoxProps<T extends object> extends BeamSelectFieldBaseProps<T> {
  children: CollectionChildren<T>;
  filteredOptions?: T[];
  inputValue?: string | undefined;
  selectedKey?: Key;
  onSelectionChange: (key: Key) => any;
  onOpenChange: (isOpen: boolean) => void;
  onInputChange: (value: string) => void;
}

/** Ties together ComboBoxInput (text field) and the ListBoxPopup (drop down). */
function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  const {
    compact = false,
    disabled: isDisabled = false,
    errorMsg,
    helperText,
    label,
    onInputChange,
    onSelectionChange,
    readOnly: isReadOnly = false,
    fieldDecoration,
    filteredOptions: items,
    ...otherProps
  } = props;

  type MenuTriggerAction = "focus" | "input" | "manual";
  const menuTrigger: MenuTriggerAction = "focus";

  const comboBoxProps = { ...otherProps, items, isDisabled, isReadOnly, label, onInputChange, menuTrigger };
  const state = useComboBoxState({ ...comboBoxProps, onSelectionChange });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const listBoxRef = useRef<HTMLUListElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // For the most part, the returned props contain `aria-*` and `id` attributes for accessibility purposes.
  const { buttonProps: triggerProps, inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...comboBoxProps,
      inputRef,
      buttonRef: triggerRef,
      listBoxRef,
      popoverRef,
    },
    state,
  );

  const { buttonProps } = useButton({ ...triggerProps, isDisabled: isDisabled || isReadOnly }, triggerRef);
  const { isFocused, focusProps } = useFocusRing({ ...props, within: true });
  const tid = useTestIds(props);

  // useOverlayPosition moves the overlay to the top of the DOM to avoid any z-index issues. Uses the `targetRef` to DOM placement
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: inputWrapRef,
    overlayRef: popoverRef,
    scrollRef: listBoxRef,
    shouldFlip: true,
    isOpen: state.isOpen,
    onClose: state.close,
  });

  return (
    <div css={Css.dif.flexColumn.$}>
      {label && <Label labelProps={labelProps} label={label} {...tid.label} />}
      <div css={Css.dib.$} {...focusProps}>
        <ComboBoxInput
          buttonProps={buttonProps}
          buttonRef={triggerRef}
          compact={compact}
          errorMsg={errorMsg}
          helperText={helperText}
          fieldDecoration={fieldDecoration}
          inputProps={inputProps}
          inputRef={inputRef}
          inputWrapRef={inputWrapRef}
          isDisabled={isDisabled}
          isFocused={isFocused}
          isReadOnly={isReadOnly}
          state={state}
        />
        {state.isOpen && (
          <ListBoxPopup
            {...listBoxProps}
            state={state}
            compact={compact}
            popoverRef={popoverRef}
            listBoxRef={listBoxRef}
            positionProps={positionProps}
          />
        )}
      </div>
    </div>
  );
}

interface ComboBoxInputProps<T extends object> {
  buttonProps: any;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  inputWrapRef: MutableRefObject<HTMLDivElement | null>;
  compact?: boolean;
  state: ComboBoxState<T>;
  isFocused: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  fieldDecoration?: (opt: T) => ReactNode;
  errorMsg?: string;
  helperText?: string | ReactNode;
}

function ComboBoxInput<T extends object>(props: ComboBoxInputProps<T>) {
  const {
    inputProps,
    inputRef,
    inputWrapRef,
    buttonProps,
    buttonRef,
    compact = false,
    errorMsg,
    helperText,
    state,
    isFocused,
    fieldDecoration,
    isDisabled,
    isReadOnly,
  } = props;
  const errorMessageId = `${inputProps.id}-error`;
  const { hoverProps, isHovered } = useHover({});
  const fieldDecorationWidth = 32;
  const fieldWidth = getFieldWidth(compact);
  const hoverStyles = isHovered && !isReadOnly && !isFocused ? Css.bgGray100.$ : {};
  const focusStyles = isFocused && !isReadOnly ? Css.bLightBlue500.$ : {};
  const errorStyles = errorMsg ? Css.bRed500.$ : {};
  const disabledStyles = isDisabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {};
  const readOnlyStyles = isReadOnly ? Css.bn.pl0.pt0.add("backgroundColor", "unset").$ : {};
  const tid = useTestIds(inputProps); // data-testid comes in through here

  return (
    <Fragment>
      <div
        css={{
          ...Css.df.ba.bGray300.br4.bgWhite.w(px(fieldWidth)).$,
          ...hoverStyles,
          ...errorStyles,
          ...focusStyles,
          ...disabledStyles,
          ...readOnlyStyles,
        }}
        {...hoverProps}
        ref={inputWrapRef as any}
      >
        {fieldDecoration && state.selectedItem && (
          <span
            css={{
              ...Css.df.itemsCenter.br4.pl1.wPx(fieldDecorationWidth).fs0.$,
              ...errorStyles,
              ...hoverStyles,
              ...focusStyles,
            }}
          >
            {fieldDecoration(state.selectedItem.value)}
          </span>
        )}
        <input
          {...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg) })}
          {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
          ref={inputRef as any}
          css={{
            ...Css.smEm.mw0.fg1.px1.bgWhite.br4.pyPx(10).gray900.outline0.if(compact).pyPx(6).$,
            ...hoverStyles,
            ...disabledStyles,
            ...readOnlyStyles,
          }}
          onFocus={(e) => {
            if (isReadOnly) return;
            e.target.select();
            state.open();
          }}
        />
        {!isReadOnly && (
          <button
            {...buttonProps}
            disabled={isDisabled}
            ref={buttonRef}
            css={{
              ...Css.dif.br4.outline0.itemsCenter.pr1.$,
              ...disabledStyles,
            }}
          >
            <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} color={Palette.Gray700} />
          </button>
        )}
      </div>

      {errorMsg && <ErrorMessage id={errorMessageId} errorMsg={errorMsg} {...tid.errorMsg} />}
      {helperText && <HelperText helperText={helperText} {...tid.helperText} />}
    </Fragment>
  );
}

interface ListBoxPopupProps<T> {
  state: ComboBoxState<T>;
  compact: boolean;
  listBoxRef: MutableRefObject<HTMLUListElement | null>;
  popoverRef: MutableRefObject<HTMLDivElement | null>;
  positionProps: React.HTMLAttributes<Element>;
}

function ListBoxPopup<T extends object>(props: ListBoxPopupProps<T>) {
  const { state, compact, popoverRef, listBoxRef, positionProps, ...otherProps } = props;
  const { overlayProps } = useOverlay(
    { onClose: () => state.close(), shouldCloseOnBlur: true, isOpen: state.isOpen, isDismissable: true },
    popoverRef,
  );
  const { listBoxProps } = useListBox({ disallowEmptySelection: true, ...otherProps }, state, listBoxRef);

  positionProps.style = {
    ...positionProps.style,
    width: getFieldWidth(compact),
  };

  return (
    <OverlayContainer>
      <div {...{ ...overlayProps, ...positionProps }} ref={popoverRef}>
        <ul
          css={{
            ...Css.mtPx(4).bgWhite.br4.w100.bshBasic.$,
            "&:hover": Css.bshHover.$,
          }}
          ref={listBoxRef}
          {...listBoxProps}
        >
          {[...state.collection].map((item) => (
            <Option key={item.key} item={item} state={state} />
          ))}
        </ul>
      </div>
    </OverlayContainer>
  );
}

function Option<T extends object>({ item, state }: { item: Node<T>; state: ComboBoxState<T> }) {
  const ref = useRef<HTMLLIElement>(null);
  const isDisabled = state.disabledKeys.has(item.key);
  const isSelected = state.selectionManager.isSelected(item.key);
  // Track focus via focusedKey state instead of with focus event listeners
  // since focus never leaves the text input in a ComboBox
  const isFocused = state.selectionManager.focusedKey === item.key;
  const { hoverProps, isHovered } = useHover({});

  // Get props for the option element.
  // Prevent options from receiving browser focus via shouldUseVirtualFocus.
  const { optionProps } = useOption(
    {
      key: item.key,
      isDisabled,
      isSelected,
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      shouldUseVirtualFocus: true,
    },
    state,
    ref,
  );

  return (
    <li
      {...optionProps}
      {...hoverProps}
      ref={ref as any}
      css={{
        ...Css.df.itemsCenter.justifyBetween.py1.px2.mh("42px").cursorPointer.gray900.sm.$,
        ...(isHovered ? Css.bgGray100.$ : {}),
        ...(isFocused ? Css.add("boxShadow", `0 0 0 1px ${Palette.LightBlue700}`).$ : {}),
      }}
    >
      {item.rendered}
      {isSelected && (
        <span css={Css.fs0.$}>
          <Icon icon="check" color={Palette.LightBlue700} />
        </span>
      )}
    </li>
  );
}

const getFieldWidth = (compact: boolean) => (compact ? 248 : 320);

interface BeamSelectFieldBaseProps<T> extends BeamFocusableProps {
  compact?: boolean;
  disabled?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  /** Allow placing an icon/decoration within the input field. */
  fieldDecoration?: (opt: T) => ReactNode;
  /** Sets the form field label. */
  label?: string;
  readOnly?: boolean;
}
