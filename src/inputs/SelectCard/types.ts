import { InputHTMLAttributes, ReactNode } from "react";
import { IconProps } from "src/components/Icon";
import { PresentationFieldProps } from "src/components/PresentationContext";
import { Value } from "src/inputs";

export type SelectCardView = "grid" | "list";

/** Grid-view card layout: icon above the text (vertical) or to its left (horizontal). */
export type SelectCardLayout = "vertical" | "horizontal";

type SelectCardGroupItemOptionBase<V extends Value> = {
  label: string;
  /** Optional secondary copy shown beneath the label. */
  description?: ReactNode;
  disabled?: boolean;
  /** Tooltip shown on hover, i.e. to explain why the option is disabled. */
  tooltip?: ReactNode;
  /** The value of the SelectCardGroup item. */
  value: V;
  /** For checkbox groups, selecting this option clears other options and cannot be combined. */
  selectionBehavior?: "exclusive";
};

/** Grid-view option; requires either `icon` or `image` (image url shown in place of the icon). */
export type SelectCardGridGroupItemOption<V extends Value> = SelectCardGroupItemOptionBase<V> &
  ({ icon: IconProps["icon"]; image?: never } | { image: string; icon?: never });

/** List-view option; `icon` is ignored when present. */
export type SelectCardListGroupItemOption<V extends Value> = SelectCardGroupItemOptionBase<V> & {
  icon?: IconProps["icon"];
};

export type SelectCardGroupItemOption<V extends Value> =
  | SelectCardGridGroupItemOption<V>
  | SelectCardListGroupItemOption<V>;

type SelectCardGroupFieldPropsBase = {
  label: string;
  errorMsg?: string;
  helperText?: string | ReactNode;
  disabled?: boolean;
} & Pick<PresentationFieldProps, "labelStyle">;

type SelectCardGroupViewProps<V extends Value> =
  | {
      /** Grid of icon cards (default). */
      view?: "grid";
      /** Icon above the text (default) or to its left. */
      layout?: SelectCardLayout;
      options: SelectCardGridGroupItemOption<V>[];
    }
  | {
      /** Stacked checkbox/radio rows; option icons are ignored. */
      view: "list";
      layout?: never;
      options: SelectCardListGroupItemOption<V>[];
    };

/** Single-select radio group. */
export type SelectCardGroupProps<V extends Value> = SelectCardGroupFieldPropsBase &
  SelectCardGroupViewProps<V> & {
    value: V | undefined;
    onChange: (value: V) => void;
  };

/** Multi-select checkbox group. */
export type MultiSelectCardGroupProps<V extends Value> = SelectCardGroupFieldPropsBase &
  SelectCardGroupViewProps<V> & {
    values: V[];
    onChange: (values: V[]) => void;
  };

export type SelectCardGroupItemProps<V extends Value> = {
  option: SelectCardGroupItemOption<V>;
  isSelected: boolean;
  view: SelectCardView;
  layout?: SelectCardLayout;
};

export type SelectCardShared = {
  label: string;
  /** Optional secondary copy shown beneath the label. When present the card grows to fit it. */
  description?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  tooltip?: ReactNode;
};

/** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
export type SelectCardStoryState = {
  hovered?: boolean;
  focusVisible?: boolean;
  pressed?: boolean;
};

export type SelectCardItemProps = SelectCardShared & {
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  __storyState?: SelectCardStoryState;
};
