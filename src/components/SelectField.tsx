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
import { Icon } from "src/components/Icon";
import { Label } from "src/components/Label";
import { Css, Palette, px } from "src/Css";
import { BeamFocusableProps } from "src/interfaces";

export interface SelectFieldProps<T extends object> extends BeamSelectFieldBaseProps<T> {
  getOptionLabel: (opt: T) => string;
  getOptionMenuLabel?: (opt: T) => string | ReactNode;
  getOptionValue: (opt: T) => Key;
  onSelect: (opt: T | undefined) => void;
  options: T[];
  selectedOption: T | undefined;
}

export function SelectField<T extends object>(props: SelectFieldProps<T>) {
  const {
    getOptionLabel,
    getOptionMenuLabel = getOptionLabel,
    getOptionValue,
    onSelect,
    options,
    selectedOption,
    ...beamSelectFieldProps
  } = props;

  const { contains } = useFilter({ sensitivity: "base" });

  const [fieldState, setFieldState] = useState<{
    isOpen: boolean;
    selectedKey: Key | undefined;
    inputValue: string;
    filteredOptions: T[];
  }>({
    isOpen: false,
    selectedKey: selectedOption && getOptionValue(selectedOption),
    inputValue: selectedOption ? getOptionLabel(selectedOption) : "",
    filteredOptions: options,
  });

  return (
    <ComboBox<T>
      {...beamSelectFieldProps}
      filteredOptions={fieldState.filteredOptions}
      inputValue={fieldState.inputValue}
      selectedKey={fieldState.selectedKey}
      onSelectionChange={(key) => {
        const selectedItem = options.find((o) => getOptionValue(o) === key);
        setFieldState({
          isOpen: false,
          inputValue: selectedItem ? getOptionLabel(selectedItem) : "",
          selectedKey: key,
          filteredOptions: options,
        });
        onSelect && onSelect(selectedItem);
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

function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  const {
    compact = false,
    disabled: isDisabled = false,
    errorMsg,
    label,
    onInputChange,
    onSelectionChange,
    readOnly: isReadOnly = false,
    fieldDecoration,
    filteredOptions: items,
    ...otherProps
  } = props;
  const comboBoxProps = { ...otherProps, items, isDisabled, isReadOnly, label, onInputChange };
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
      menuTrigger: "focus",
    },
    state,
  );

  const { buttonProps } = useButton({ ...triggerProps, isDisabled: isDisabled || isReadOnly }, triggerRef);
  const { isFocused, focusProps } = useFocusRing({ ...props, within: true });

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
      {label && <Label labelProps={labelProps} label={label} />}
      <div css={Css.dib.$} {...focusProps}>
        <ComboBoxInput
          buttonProps={buttonProps}
          buttonRef={triggerRef}
          compact={compact}
          errorMsg={errorMsg}
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
  const hoverStyles = isHovered && !isFocused ? Css.bgGray100.$ : {};
  const focusStyles = isFocused ? Css.bLightBlue500.$ : {};
  const errorStyles = errorMsg ? Css.bRed500.$ : {};
  const disabledStyles = isDisabled ? Css.gray400.bgGray100.cursorNotAllowed.$ : {};

  return (
    <Fragment>
      <div
        css={{
          ...Css.df.ba.bGray300.br4.bgWhite.w(px(fieldWidth)).$,
          ...hoverStyles,
          ...errorStyles,
          ...focusStyles,
          ...disabledStyles,
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
            ...Css.sm.mw0.fg1.px1.bgWhite.br4.pyPx(10).gray800.outline0.if(compact).pyPx(6).$,
            ...hoverStyles,
            ...disabledStyles,
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
            <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />
          </button>
        )}
      </div>

      {errorMsg && (
        <div id={errorMessageId} css={Css.red600.sm.df.w(px(fieldWidth)).mtPx(4).$}>
          <span css={Css.fs0.$}>
            <Icon icon="error" color={Palette.Red600} />
          </span>
          <span css={Css.ml1.mtPx(2).$}>{errorMsg}</span>
        </div>
      )}
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
        ...Css.df.itemsCenter.justifyBetween.pxPx(12).py1.mh("42px").cursorPointer.gray800.smEm.$,
        ...(isHovered ? Css.bgGray100.$ : {}),
        ...(isFocused ? Css.add("boxShadow", `0 0 0 1px ${Palette.LightBlue700}`).$ : {}),
      }}
    >
      {item.rendered}
      {isSelected && (
        <span css={Css.fs0.$}>
          <Icon icon="check" color={Palette.LightBlue500} />
        </span>
      )}
    </li>
  );
}

const getFieldWidth = (compact: boolean) => (compact ? 248 : 320);

interface BeamSelectFieldBaseProps<T extends object> extends BeamFocusableProps {
  compact?: boolean;
  disabled?: boolean;
  errorMsg?: string;
  fieldDecoration?: (opt: T) => ReactNode;
  label?: string;
  readOnly?: boolean;
}
