import type { KeyboardEvent, RefObject } from "react";
import { Icon } from "src/components/Icon";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type MenuSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Accessible name, e.g. "Search Options". */
  label: string;
  placeholder?: string;
  /** The listbox this input drives. */
  listId: string;
  /** DOM id of the option that has virtual focus. */
  activeDescendant?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

/** Search input pinned in a menu header; keeps DOM focus while arrow keys move virtual focus in the list. */
export function MenuSearchInput(props: MenuSearchInputProps) {
  const { value, onChange, inputRef, label, placeholder = "Search", listId, activeDescendant, onKeyDown } = props;
  const tid = useTestIds(props, "menuSearch");
  return (
    <label css={Css.df.aic.gap1.px2.hPx(48).cursor("text").$}>
      <span css={Css.df.aic.fs0.color(Tokens.OnSurfaceMuted).$}>
        <Icon icon="search" />
      </span>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded
        aria-controls={listId}
        aria-activedescendant={activeDescendant}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        css={inputCss}
        {...tid.search}
      />
    </label>
  );
}

const inputCss = {
  ...Css.fg1.mw0.outline0.bgTransparent.sm.color(Tokens.OnSurface).$,
  // Placeholder color comes from `input::placeholder` in `CssReset.css`, same as the other inputs.
  // iOS zooms the page when a focused input is under 16px.
  ...Css.ifSm.add("fontSize", "16px").$,
};
