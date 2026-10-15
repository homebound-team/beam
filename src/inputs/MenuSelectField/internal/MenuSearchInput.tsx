import type { KeyboardEvent, RefObject } from "react";
import { Icon } from "src/components/Icon";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

/** Search field for an open menu. Present only when the option list is long enough to search. */
export type MenuSearchState = {
  show: boolean;
  value: string;
  onChange: (value: string) => void;
  /** The listbox this input drives. */
  listId: string;
  /** DOM id of the option that has virtual focus. */
  activeDescendant?: string;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
};

type MenuSearchInputProps = {
  search: MenuSearchState;
  inputRef: RefObject<HTMLInputElement | null>;
  /** Accessible name, e.g. "Search Options". */
  label: string;
  placeholder?: string;
};

/** Search input pinned in a menu header; keeps DOM focus while arrow keys move virtual focus in the list. */
export function MenuSearchInput(props: MenuSearchInputProps) {
  const { search, inputRef, label, placeholder = "Search" } = props;
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
        aria-controls={search.listId}
        aria-activedescendant={search.activeDescendant}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder={placeholder}
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
        onKeyDown={search.onKeyDown}
        css={inputCss}
        {...tid.search}
      />
    </label>
  );
}

const inputCss = {
  ...Css.fg1.mw0.outline0.bgTransparent.sm.color(Tokens.OnSurface).$,
  // iOS zooms the page when a focused input is under 16px.
  ...Css.ifSm.fsPx(16).$,
};
