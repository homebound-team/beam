import type { Key } from "@react-types/shared";
import {
  type JSX,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ListKeyboardDelegate, mergeProps, useFilter, useFocusRing, useHover } from "react-aria";
import { Item, type Selection, useListState } from "react-stately";
import { CountBadge } from "src/components/CountBadge";
import { HelperText } from "src/components/HelperText";
import { Icon } from "src/components/Icon";
import { AnchoredOverlay } from "src/components/internal/overlay/AnchoredOverlay";
import { BottomSheet } from "src/components/internal/overlay/BottomSheet";
import { MenuPanel } from "src/components/internal/overlay/MenuPanel";
import { Label } from "src/components/Label";
import { type PresentationFieldProps, usePresentationContext } from "src/components/PresentationContext";
import { OriginalValue, ProposedValue } from "src/components/ProposedValue";
import { BorderHoverChild } from "src/components/Table/components/Row";
import { maybeTooltip, resolveTooltip, Tooltip } from "src/components/Tooltip";
import { Css, Tokens } from "src/Css";
import { useLabelSuffix } from "src/forms/labelUtils";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { ErrorMessage } from "src/inputs/ErrorMessage";
import { getFieldChrome, selectedValueCss } from "src/inputs/fieldChrome";
import { useAiProposal } from "src/inputs/hooks/useAiProposal";
import { disabledOptionToKeyedTuple, initializeOptions, type OptionsOrLoad } from "src/inputs/internal/ComboBoxBase";
import { menuRowHeight } from "src/inputs/internal/menuList/MenuRow";
import { MenuSearchInput } from "src/inputs/internal/menuList/MenuSearchInput";
import { optionDomId, OptionList } from "src/inputs/internal/menuList/OptionList";
import { type Value, valueToKey } from "src/inputs/Value";
import type { TextFieldInternalProps } from "src/interfaces";
import { defaultTestId } from "src/utils/defaultTestId";
import { maybeCall } from "src/utils/helpers";
import { defaultOptionLabel, defaultOptionValue } from "src/utils/options";
import { useTestIds } from "src/utils/useTestIds";

/** Props shared by `MenuSelectField` and `MenuMultiSelectField`. */
export type MenuSelectFieldBaseProps<O, V extends Value> = {
  label: string;
  /** The full list, or the selected option plus a loader fired the first time the menu opens. */
  options: OptionsOrLoad<O>;
  /** Defaults to `option.id`. */
  getOptionValue?: (opt: O) => V;
  /** String used in the trigger and the option's accessible name. Defaults to `option.name`. */
  getOptionLabel?: (opt: O) => string;
  /** Custom content for the menu row. Falls back to `getOptionLabel`. */
  getOptionMenuLabel?: (opt: O) => ReactNode;
  /** Extra text the menu search matches, in addition to `getOptionLabel`. */
  getOptionSearchText?: (opt: O) => string | readonly string[];
  disabledOptions?: (V | { value: V; reason: string })[];
  /** Shown in the field when nothing is selected, e.g. "All". */
  nothingSelectedText?: string;
  placeholder?: string;
  /** Placeholder for the search input inside the menu. */
  searchPlaceholder?: string;
  /** Whether the field is disabled. If a ReactNode, it's shown as the disabled reason in a tooltip. */
  disabled?: boolean | ReactNode;
  /** Whether the field is read-only. If a ReactNode, it's shown as the read-only reason in a tooltip. */
  readOnly?: boolean | ReactNode;
  required?: boolean;
  errorMsg?: string;
  helperText?: string | ReactNode;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
} & Pick<
  PresentationFieldProps,
  | "labelStyle"
  | "compact"
  | "borderless"
  | "borderOnHover"
  | "fullWidth"
  | "visuallyDisabled"
  | "errorInTooltip"
  | "inputStylePalette"
>;

type BaseMenuSelectFieldProps<O, V extends Value> = MenuSelectFieldBaseProps<O, V> & {
  selectionMode: "single" | "multiple";
  values: V[];
  /** Values proposed by an AI model; puts the field in AI mode. */
  proposedValues?: V[];
  onCommit: (values: V[], opts: O[]) => void;
};

/** Shared menu for `MenuSelectField` and `MenuMultiSelectField`. Desktop popover; small screens a bottom sheet. */
export function BaseMenuSelectField<O, V extends Value>(props: BaseMenuSelectFieldProps<O, V>): JSX.Element {
  const {
    label,
    options: optionsProp,
    getOptionValue = defaultOptionValue as (opt: O) => V,
    getOptionLabel = defaultOptionLabel as (opt: O) => string,
    getOptionMenuLabel,
    getOptionSearchText,
    disabledOptions,
    nothingSelectedText = "",
    placeholder,
    searchPlaceholder,
    disabled,
    readOnly,
    required,
    errorMsg,
    helperText,
    onFocus,
    onBlur,
    labelStyle: labelStyleProp,
    inputStylePalette,
    selectionMode,
    values: propValues,
    proposedValues,
    onCommit,
  } = props;
  const internalProps: TextFieldInternalProps = (props as any).internalProps ?? {};
  const { compound = false, forceFocus = false, forceHover = false } = internalProps;
  const multiple = selectionMode === "multiple";
  const isDisabled = !!disabled;
  const isReadOnly = !!readOnly;
  const tid = useTestIds(props, defaultTestId(label));
  const { sm: isMobile } = useBreakpoint();
  const { fieldProps } = usePresentationContext();
  const labelStyle = labelStyleProp ?? fieldProps?.labelStyle ?? "above";
  const compact = props.compact ?? fieldProps?.compact ?? false;
  const borderless = props.borderless ?? fieldProps?.borderless ?? false;
  const borderOnHover = props.borderOnHover ?? fieldProps?.borderOnHover ?? false;
  const fullWidth = props.fullWidth ?? fieldProps?.fullWidth ?? false;
  const visuallyDisabled = props.visuallyDisabled ?? fieldProps?.visuallyDisabled ?? true;
  const errorInTooltip = props.errorInTooltip ?? fieldProps?.errorInTooltip ?? false;
  const typeScale = fieldProps?.typeScale ?? "sm";
  const labelSuffix = useLabelSuffix(required, isReadOnly);

  const listId = useId();
  const triggerId = useId();
  const labelId = useId();
  const valueId = useId();
  const errorId = `${triggerId}-error`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Tracks field-level focus across the trigger and the portaled menu, so onFocus/onBlur fire once per visit.
  const hasFocusRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(false);
  const optionsPropRef = useRef(optionsProp);
  optionsPropRef.current = optionsProp;
  const didRequestOptionsRef = useRef(false);
  const options = useMemo(
    () => initializeOptions(optionsProp, getOptionValue, getOptionLabel, undefined, false),
    // getOptionValue and getOptionLabel are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [optionsProp],
  );
  const { hoverProps, isHovered } = useHover({});
  const { focusProps, isFocusVisible } = useFocusRing();
  const { contains } = useFilter({ sensitivity: "base" });

  const optionsByKey = useMemo(
    () => new Map(options.map((o) => [valueToKey(getOptionValue(o)), o])),
    // getOptionValue is typically an inline lambda
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [options],
  );
  // Selection, trigger text, and the menu's checks all follow the proposal until the user picks something.
  const { effectiveValue, proposalProps } = useAiProposal(propValues, proposedValues, (vs) =>
    labelsFor(vs, optionsByKey, getOptionLabel).join(", "),
  );
  const values = useMemo(() => effectiveValue ?? [], [effectiveValue]);
  const selectedKeys = useMemo(() => new Set(values.map(valueToKey)), [values]);
  const selectedOptions = useMemo(
    () => values.map((v) => optionsByKey.get(valueToKey(v))).filter((o): o is O => o !== undefined),
    [values, optionsByKey],
  );
  const filteredOptions = useMemo(
    () =>
      search ? options.filter((o) => matchesSearch(o, search, getOptionLabel, getOptionSearchText, contains)) : options,
    // getOptionLabel and getOptionSearchText are typically inline lambdas
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [options, search, contains],
  );
  const [disabledKeys, disabledReasons] = useMemo(() => {
    const tuples = (disabledOptions ?? []).map(disabledOptionToKeyedTuple);
    return [tuples.map(([k]) => String(k)), Object.fromEntries(tuples.map(([k, r]) => [String(k), r]))];
  }, [disabledOptions]);

  function onSelectionChange(keys: Selection) {
    if (keys === "all") return;
    if (!multiple) {
      const [key] = [...keys];
      // Re-selecting the current value toggles it off in react-stately; treat that as "keep it" and close.
      if (key === undefined) {
        close({ restoreFocus: true });
        return;
      }
      const opt = optionsByKey.get(String(key));
      proposalProps.onUserEdit?.();
      onCommit(opt === undefined ? [] : [getOptionValue(opt)], opt === undefined ? [] : [opt]);
      close({ restoreFocus: true });
      return;
    }
    // Filtering hides options but must not drop their selection, so merge against the visible set.
    const visible = new Set(filteredOptions.map((o) => valueToKey(getOptionValue(o))));
    const next = values.filter((v) => {
      const k = valueToKey(v);
      return !visible.has(k) || keys.has(k);
    });
    for (const k of keys) {
      const opt = optionsByKey.get(String(k));
      if (opt !== undefined && !selectedKeys.has(String(k))) next.push(getOptionValue(opt));
    }
    proposalProps.onUserEdit?.();
    onCommit(
      next,
      next.map((v) => optionsByKey.get(valueToKey(v))).filter((o): o is O => o !== undefined),
    );
  }

  const state = useListState<O>({
    items: filteredOptions,
    children: (o: O) => (
      <Item key={valueToKey(getOptionValue(o))} textValue={getOptionLabel(o)}>
        {getOptionMenuLabel ? getOptionMenuLabel(o) : getOptionLabel(o)}
      </Item>
    ),
    selectionMode: multiple ? "multiple" : "single",
    selectedKeys,
    disabledKeys,
    onSelectionChange,
  });
  const { selectionManager } = state;

  // Page keys step the collection. Measuring the DOM under-counts a virtualized list.
  const keyboardDelegate = useMemo(
    () =>
      new MenuSelectKeyboardDelegate<O>({
        collection: state.collection,
        disabledKeys: state.disabledKeys,
        ref: listRef,
      }),
    [state.collection, state.disabledKeys],
  );

  const open = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    setSearch("");
    setIsOpen(true);
    const spec = optionsPropRef.current;
    if (didRequestOptionsRef.current || Array.isArray(spec)) return;
    didRequestOptionsRef.current = true;
    setOptionsLoading(true);
    void spec.load().finally(() => setOptionsLoading(false));
  }, [isDisabled, isReadOnly]);

  function close(opts: { restoreFocus: boolean }) {
    setIsOpen(false);
    setSearch("");
    if (opts.restoreFocus) {
      triggerRef.current?.focus({ preventScroll: true });
    } else if (hasFocusRef.current) {
      settleBlur();
    }
  }

  function settleBlur() {
    hasFocusRef.current = false;
    maybeCall(proposalProps.onUserBlur);
    maybeCall(onBlur);
  }

  // Focus the search when the menu mounts. Leave option focus unset until a keyboard move.
  useLayoutEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus({ preventScroll: true });
    selectionManager.setFocusedKey(null);
    selectionManager.setFocused(false);
    // Only on open; later selection changes shouldn't move focus.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Typing starts a new list, so drop any keyboard highlight until the next arrow.
  function onSearchChange(value: string) {
    setSearch(value);
    selectionManager.setFocusedKey(null);
    selectionManager.setFocused(false);
  }

  function focusKey(key: Key | null) {
    if (key == null) return;
    // `isFocused` is what paints the row. Set it here so open and search can leave it off.
    selectionManager.setFocused(true);
    selectionManager.setFocusedKey(key);
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const current = selectionManager.focusedKey;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusKey(
          current == null
            ? keyboardDelegate.getFirstKey()
            : (keyboardDelegate.getKeyBelow(current) ?? keyboardDelegate.getFirstKey()),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        focusKey(
          current == null
            ? keyboardDelegate.getLastKey()
            : (keyboardDelegate.getKeyAbove(current) ?? keyboardDelegate.getLastKey()),
        );
        break;
      case "PageDown":
        e.preventDefault();
        focusKey(current == null ? keyboardDelegate.getFirstKey() : keyboardDelegate.getKeyPageBelow(current));
        break;
      case "PageUp":
        e.preventDefault();
        focusKey(current == null ? keyboardDelegate.getLastKey() : keyboardDelegate.getKeyPageAbove(current));
        break;
      case "Home":
        e.preventDefault();
        focusKey(keyboardDelegate.getFirstKey());
        break;
      case "End":
        e.preventDefault();
        focusKey(keyboardDelegate.getLastKey());
        break;
      case "Enter": {
        e.preventDefault();
        const key = selectionManager.focusedKey;
        if (key != null && !state.disabledKeys.has(key)) selectionManager.select(key);
        break;
      }
      case "Escape":
        e.preventDefault();
        // Keep an enclosing Modal from also closing.
        e.stopPropagation();
        close({ restoreFocus: true });
        break;
      case "Tab":
        // The menu is portaled to the end of <body>; tabbing out would leave the page, so return to the trigger.
        e.preventDefault();
        close({ restoreFocus: true });
        break;
      default:
        break;
    }
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    // Enter and Space activate the button's click. Arrows only open.
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      open();
    }
  }

  const focusedKey = selectionManager.focusedKey;
  const focusedIndex = focusedKey != null ? state.collection.getItem(focusedKey)?.index : undefined;
  const activeDescendant = isOpen && focusedIndex !== undefined ? optionDomId(listId, focusedIndex) : undefined;
  const initialIndex = Math.max(
    0,
    filteredOptions.findIndex((o) => selectedKeys.has(valueToKey(getOptionValue(o)))),
  );

  const selectedText = !multiple && selectedOptions[0] !== undefined ? getOptionLabel(selectedOptions[0]) : "";
  // Multi with a selection shows only the count badge; an empty field shows nothing-selected text, then the placeholder.
  const displayText = selectedText || (values.length > 0 ? "" : nothingSelectedText || placeholder || "");
  const isPlaceholder = !selectedText && values.length === 0 && !nothingSelectedText && !!placeholder;
  const selectedLabels = selectedOptions.map((o) => ({
    key: valueToKey(getOptionValue(o)),
    label: getOptionLabel(o),
  }));
  const preferredHeight = searchHeaderHeight + Math.max(1, filteredOptions.length) * menuRowHeight;

  const panel = (
    <MenuPanel
      variant={isMobile ? "sheet" : "anchored"}
      header={
        <MenuSearchInput
          value={search}
          onChange={onSearchChange}
          inputRef={searchRef}
          label={`Search ${label}`}
          placeholder={searchPlaceholder}
          listId={listId}
          activeDescendant={activeDescendant}
          onKeyDown={onSearchKeyDown}
          {...tid}
        />
      }
      {...tid}
    >
      <OptionList
        state={state}
        listRef={listRef}
        id={listId}
        label={label}
        variant={multiple ? "checkbox" : "check"}
        loading={optionsLoading}
        disabledReasons={disabledReasons}
        initialIndex={initialIndex}
        {...tid}
      />
    </MenuPanel>
  );

  const showFocus = ((isFocusVisible || isOpen) && !isDisabled && !isReadOnly) || forceFocus;
  const showHover = (isHovered && !isDisabled && !isReadOnly && !showFocus) || forceHover;
  // A compound field draws the box and owns anything below the control.
  const showErrorAndHelper = !compound && !isDisabled && !isReadOnly;
  const { proposedValue: proposedText, originalValue: originalText } = proposalProps;
  const showProposal = proposedText !== undefined;
  // Read-only draws both halves inline; editable fields strike the original through below.
  const originalBelow = originalText && !isReadOnly ? originalText : undefined;
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
    isHovered: isHovered || forceHover,
    showProposal,
    inputStylePalette,
  });
  const fieldStateCss = {
    ...fieldChrome.control,
    ...(isDisabled ? fieldChrome.disabled : {}),
    ...(showFocus ? fieldChrome.focus : {}),
    ...(showHover ? fieldChrome.hover : {}),
    ...(errorMsg && !isDisabled ? fieldChrome.error : {}),
    ...Css.tal.outline0.add("appearance", "none").add("font", "inherit").if(!isDisabled).cursorPointer.$,
  };

  const valueNode = (
    <>
      {labelStyle === "inline" && (
        <span
          id={labelId}
          css={Css.sm.wsnw.prPx(4).color(isDisabled && visuallyDisabled ? "currentColor" : Tokens.TextLabel).$}
        >
          {label}:
        </span>
      )}
      <span id={valueId} css={Css.df.aic.fg1.mw0.oh.$}>
        {isReadOnly && showProposal ? (
          <span css={Css.fg1.truncate.$}>
            <ProposedValue original={originalText} proposed={proposedText} {...tid.proposedValue} />
          </span>
        ) : (
          <>
            {multiple && selectedLabels.length > 0 && (
              <Tooltip title={<SelectedLabels labels={selectedLabels} />}>
                <span css={Css.df.aic.fs0.mr1.$}>
                  <CountBadge count={selectedLabels.length} {...tid.count} />
                </span>
              </Tooltip>
            )}
            <span
              css={{
                ...Css.fg1.truncate.color(isPlaceholder ? inputPlaceholderColor : undefined).$,
                // A placeholder reads as hint text, so it stays at the field's regular weight.
                ...(!isPlaceholder ? selectedValueCss(labelStyle, isReadOnly) : {}),
                ...(showProposal ? Css.fw6.color(Tokens.AiFieldFg).$ : {}),
              }}
            >
              {displayText}
            </span>
          </>
        )}
      </span>
      {errorInTooltip && errorMsg && showErrorAndHelper && (
        <span css={Css.df.aic.fs0.pl1.$}>
          <Icon icon="error" color={Tokens.Danger} tooltip={errorMsg} />
        </span>
      )}
      {!isReadOnly && (
        <span
          css={Css.df.aic.fs0.pl1.color(isDisabled ? Tokens.FieldTextDisabled : Tokens.TextPlaceholder).$}
          {...tid.toggle}
        >
          <Icon icon={isOpen ? "chevronUp" : "chevronDown"} />
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
              id: labelId,
              htmlFor: isReadOnly ? undefined : triggerId,
              onClick: (event) => {
                // A native label click would also activate the button and toggle the menu shut.
                event.preventDefault();
                if (isDisabled || isReadOnly || isOpen) return;
                triggerRef.current?.focus();
                open();
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
          children: isReadOnly ? (
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
              {...mergeProps(hoverProps, focusProps, {
                id: triggerId,
                type: "button" as const,
                disabled: isDisabled,
                "aria-haspopup": "listbox" as const,
                "aria-expanded": isOpen,
                "aria-controls": listId,
                "aria-labelledby": `${labelId} ${valueId}`,
                "aria-invalid": errorMsg ? true : undefined,
                "aria-errormessage": errorMsg ? errorId : undefined,
                "data-ai-mode": showProposal ? "true" : undefined,
                onKeyDown: onTriggerKeyDown,
                onClick: () => (isOpen ? close({ restoreFocus: true }) : open()),
                onFocus: () => {
                  if (hasFocusRef.current) return;
                  hasFocusRef.current = true;
                  maybeCall(onFocus);
                },
                onBlur: () => {
                  // Moving into the open menu keeps the field "focused"; close() settles blur otherwise.
                  if (isOpen) return;
                  settleBlur();
                },
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
        {labelStyle !== "left" && (
          <>
            {/* Outside `showErrorAndHelper`, because a disabled field still shows what it's replacing. */}
            {originalBelow && <OriginalValue originalValue={originalBelow} {...tid.originalValue} />}
            {showErrorAndHelper && errorMsg && !errorInTooltip && (
              <ErrorMessage id={errorId} errorMsg={errorMsg} {...tid.errorMsg} />
            )}
            {showErrorAndHelper && helperText && <HelperText helperText={helperText} {...tid.helperText} />}
          </>
        )}
      </div>
      {labelStyle === "left" && (originalBelow || (showErrorAndHelper && (errorMsg || helperText))) && (
        <div css={Css.mtPx(-8).ml("50%").$}>
          {originalBelow && <OriginalValue originalValue={originalBelow} {...tid.originalValue} />}
          {showErrorAndHelper && errorMsg && !errorInTooltip && (
            <ErrorMessage id={errorId} errorMsg={errorMsg} {...tid.errorMsg} />
          )}
          {showErrorAndHelper && helperText && <HelperText helperText={helperText} {...tid.helperText} />}
        </div>
      )}
      {isMobile ? (
        <BottomSheet isOpen={isOpen} onClose={() => close({ restoreFocus: true })} label={label} {...tid}>
          {panel}
        </BottomSheet>
      ) : (
        <AnchoredOverlay
          triggerRef={triggerRef}
          isOpen={isOpen}
          onClose={() => close({ restoreFocus: false })}
          preferredHeight={preferredHeight}
          {...tid}
        >
          {panel}
        </AnchoredOverlay>
      )}
    </>
  );
}

/**
 * Same gray as `input::placeholder` in `CssReset.css`. The placeholder here is a span, so that rule never reaches it.
 * TODO: Move this to tokens. https://linear.app/homebound-team/issue/DS-395/update-placeholder-text-color-to-use-color-tokens
 */
const inputPlaceholderColor = "#9ca3af";

function matchesSearch<O>(
  option: O,
  query: string,
  getOptionLabel: (opt: O) => string,
  getOptionSearchText: ((opt: O) => string | readonly string[]) | undefined,
  contains: (text: string, substring: string) => boolean,
): boolean {
  if (contains(getOptionLabel(option), query)) return true;
  const extra = getOptionSearchText?.(option);
  const terms = typeof extra === "string" ? [extra] : extra;
  return terms?.some((term) => contains(term, query)) ?? false;
}

function labelsFor<O, V extends Value>(
  values: V[],
  optionsByKey: Map<string, O>,
  getOptionLabel: (opt: O) => string,
): string[] {
  return values
    .map((v) => optionsByKey.get(valueToKey(v)))
    .filter((o): o is O => o !== undefined)
    .map(getOptionLabel);
}

function SelectedLabels({ labels }: { labels: { key: string; label: string }[] }) {
  return (
    <ul css={Css.m0.pl2.$}>
      {labels.map(({ key, label }) => (
        <li key={key}>{label}</li>
      ))}
    </ul>
  );
}

/** Search header height plus its bottom border, in px. */
const searchHeaderHeight = 49;
/** Rows skipped by PageUp / PageDown. The list is virtualized, so measuring the DOM under-counts. */
const pageSize = 10;

class MenuSelectKeyboardDelegate<T> extends ListKeyboardDelegate<T> {
  override getKeyPageBelow(key: Key): Key | null {
    return stepKeys(this, key, pageSize, "below");
  }

  override getKeyPageAbove(key: Key): Key | null {
    return stepKeys(this, key, pageSize, "above");
  }
}

function stepKeys<T>(
  delegate: ListKeyboardDelegate<T>,
  key: Key,
  count: number,
  direction: "below" | "above",
): Key | null {
  let next: Key | null = key;
  for (let index = 0; index < count; index += 1) {
    if (next == null) return next;
    const candidate: Key | null = direction === "below" ? delegate.getKeyBelow(next) : delegate.getKeyAbove(next);
    if (candidate == null) return next;
    next = candidate;
  }
  return next;
}
