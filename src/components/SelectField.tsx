import { useComboBox } from "@react-aria/combobox";
import { useFilter } from "@react-aria/i18n";
import { mergeProps } from "@react-aria/utils";
import { ComboBoxState, useComboBoxState } from "@react-stately/combobox";
import { CollectionChildren, Node } from "@react-types/shared";
import React, { Fragment, InputHTMLAttributes, MutableRefObject, useRef } from "react";
import { useButton, useFocusRing, useHover, useListBox, useOption, useOverlay } from "react-aria";
import { Icon } from "src/components/Icon";
import { Label } from "src/components/Label";
import { Css, Palette } from "src/Css";
import { BeamTextFieldProps } from "src/interfaces";

interface SelectFieldProps<T extends object> extends Omit<BeamTextFieldProps, "value"> {
  children: CollectionChildren<T>;
  items: T[];
  compact?: boolean;
  getOptionValue: (option: T) => string | undefined;
  getOptionLabel: (option: T) => string | JSX.Element;
  onSelect: (option: string) => void;
  inputValue: string | undefined;
}

export function SelectField<T extends object>(props: SelectFieldProps<T>) {
  const { disabled: isDisabled = false, readOnly: isReadOnly = false, label, ...otherProps } = props;
  const comboBoxProps = { ...otherProps, isDisabled, isReadOnly, label };
  const { contains } = useFilter();
  const state = useComboBoxState({ ...comboBoxProps, defaultFilter: contains });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listBoxRef = useRef<HTMLUListElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const { buttonProps: triggerProps, inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...comboBoxProps,
      inputRef,
      buttonRef: triggerRef,
      listBoxRef,
      popoverRef,
      menuTrigger: "input",
    },
    state,
  );
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const { isFocused, focusProps } = useFocusRing({ ...props, within: true });

  return (
    <div css={Css.dif.flexColumn.$}>
      {label && <Label labelProps={labelProps} label={label} />}
      <div css={Css.dib.relative.$} {...focusProps}>
        <ComboBoxInput
          inputProps={inputProps}
          buttonProps={buttonProps}
          buttonRef={triggerRef}
          inputRef={inputRef}
          state={state}
          isFocused={isFocused}
          {...props}
        />
        {state.isOpen && (
          <ListBoxPopup {...listBoxProps} state={state} popoverRef={popoverRef} listBoxRef={listBoxRef} />
        )}
      </div>
    </div>
  );
}

interface ListBoxPopupProps<T> {
  state: ComboBoxState<T>;
  listBoxRef: MutableRefObject<HTMLUListElement | null>;
  popoverRef: MutableRefObject<HTMLDivElement | null>;
}

function ListBoxPopup<T extends object>(props: ListBoxPopupProps<T>) {
  const { state, popoverRef, listBoxRef } = props;
  const { overlayProps } = useOverlay(
    { onClose: () => state.close(), shouldCloseOnBlur: true, isOpen: state.isOpen, isDismissable: true },
    popoverRef,
  );
  let { listBoxProps } = useListBox(
    {
      disallowEmptySelection: true,
    },
    state,
    listBoxRef,
  );
  // box-shadow: 0px 4px 8px rgba(17, 24, 39, 0.1), 0px 2px 24px rgba(17, 24, 39, 0.08);
  return (
    <div {...overlayProps} ref={popoverRef}>
      <ul
        css={
          Css.absolute
            .mtPx(4)
            .bgWhite.br4.w100.add("boxShadow", "0px 4px 8px rgba(17, 24, 39, 0.1), 0px 2px 24px rgba(17, 24, 39, 0.08)")
            .$
        }
        ref={listBoxRef}
        {...listBoxProps}
      >
        {[...state.collection].map((item) => (
          <Option key={item.key} item={item} state={state} />
        ))}
      </ul>
    </div>
  );
}

interface ComboBoxInputProps<T extends object> extends Pick<BeamTextFieldProps, "errorMsg"> {
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  buttonProps: any;
  buttonRef: MutableRefObject<HTMLButtonElement | null>;
  compact?: boolean;
  state: ComboBoxState<T>;
  isFocused: boolean;
}

function ComboBoxInput<T extends object>(props: ComboBoxInputProps<T>) {
  const { inputProps, inputRef, buttonProps, buttonRef, compact = false, errorMsg, state, isFocused } = props;
  const errorMessageId = `${inputProps.id}-error`;
  const { hoverProps, isHovered } = useHover({});

  return (
    <Fragment>
      <div css={Css.df.$} {...hoverProps}>
        <input
          {...mergeProps(inputProps, { "aria-invalid": Boolean(errorMsg) })}
          {...(errorMsg ? { "aria-errormessage": errorMessageId } : {})}
          ref={inputRef as any}
          css={{
            ...Css.sm.px1.bgWhite
              .pyPx(10)
              .coolGray800.outline0.bl.bt.bb.bCoolGray300.add("borderRadius", "4px 0 0 4px")
              .if(compact)
              .pyPx(6).$,
            ...(isFocused ? Css.bSky500.$ : {}),
            "&:disabled": Css.coolGray400.bgCoolGray100.cursorNotAllowed.$,
            ...(errorMsg ? Css.bCoral500.$ : {}),
            ...(isHovered && !isFocused ? Css.bgCoolGray100.$ : {}),
          }}
        />
        <button
          {...buttonProps}
          ref={buttonRef}
          css={{
            ...Css.bgWhite.dif.itemsCenter
              .hPx(42)
              .add("borderRadius", "0 4px 4px 0")
              .br.bt.bb.bCoolGray300.if(compact)
              .hPx(34).$,
            ...(isFocused ? Css.bSky500.$ : {}),
            ...(isHovered && !isFocused ? Css.bgCoolGray100.$ : {}),
          }}
        >
          <Icon icon={state.isOpen ? "chevronUp" : "chevronDown"} />
        </button>
      </div>
      {errorMsg && (
        <div id={errorMessageId} css={Css.coral600.sm.df.mtPx(4).$}>
          <span css={Css.fs0.$}>
            <Icon icon="error" color={Palette.Coral500} />
          </span>
          <span css={Css.ml1.mtPx(2).$}>{errorMsg}</span>
        </div>
      )}
    </Fragment>
  );
}

function Option<T extends object>({ item, state }: { item: Node<T>; state: ComboBoxState<T> }) {
  let ref = React.useRef<HTMLLIElement>(null);
  let isDisabled = state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key);
  // Track focus via focusedKey state instead of with focus event listeners
  // since focus never leaves the text input in a ComboBox
  let isFocused = state.selectionManager.focusedKey === item.key;
  const { hoverProps, isHovered } = useHover({});

  // Get props for the option element.
  // Prevent options from receiving browser focus via shouldUseVirtualFocus.
  let { optionProps } = useOption(
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

  let backgroundColor;
  let color = "black";

  if (isSelected) {
    backgroundColor = "blueviolet";
    color = "white";
  } else if (isFocused) {
    backgroundColor = "gray";
  } else if (isDisabled) {
    backgroundColor = "transparent";
    color = "gray";
  }

  return (
    <li
      {...optionProps}
      {...hoverProps}
      ref={ref as any}
      css={{
        ...Css.df.itemsCenter.justifyBetween.pxPx(12).hPx(42).cursorPointer.coolGray800.smEm.$,
        ...(isHovered ? Css.bgCoolGray100.$ : {}),
        ...(isFocused ? Css.ba.bshFocus.$ : {}),
      }}
    >
      {item.rendered}
      {isSelected && (
        <span css={Css.fs0.$}>
          <Icon icon="check" color={Palette.Sky500} />
        </span>
      )}
    </li>
  );
}
