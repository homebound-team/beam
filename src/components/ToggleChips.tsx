import { ToggleChip } from "src/components/ToggleChip";
import { Css, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ToggleChipXss = Xss<Margin>;

export interface ToggleChipsProps<T, X> {
  values: T[];
  getLabel: (value: T) => string;
  onRemove: (value: T) => void;
  xss?: X;
}

/** Renders a list of `Chip`s, with wrapping & appropriate margin between each `Chip`. */
export function ToggleChips<T, X extends Only<ToggleChipXss, X>>(props: ToggleChipsProps<T, X>) {
  const { values, getLabel, onRemove, xss } = props;
  const tid = useTestIds(props, "toggleChips");
  return (
    <div css={{ ...Css.df.add("flexWrap", "wrap").gap1.$, ...xss }} {...tid}>
      {values.map((value) => (
        <ToggleChip key={getLabel(value)} text={getLabel(value)} onClick={() => onRemove(value)} {...tid.chip} />
      ))}
    </div>
  );
}
