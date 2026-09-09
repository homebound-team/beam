import { Css } from "src/Css";
import { SelectedOptionPill, type SelectedOptionPillProps } from "src/forms/SelectedOptionPill";
import { useTestIds } from "src/utils/useTestIds";

export type SelectedOptionPillListProps = {
  options: Array<{ id: string } & SelectedOptionPillProps>;
};

/** A vertical stack of {@link SelectedOptionPill}s. Renders nothing when `options` is empty. */
export function SelectedOptionPillList(props: SelectedOptionPillListProps) {
  const { options } = props;
  const tid = useTestIds(props, "selectedOptionPillList");
  if (options.length === 0) return null;
  return (
    <div css={Css.df.fdc.gap2.w100.$} {...tid}>
      {options.map(({ id, ...pill }) => (
        <SelectedOptionPill key={id} {...pill} {...tid.pill} />
      ))}
    </div>
  );
}
