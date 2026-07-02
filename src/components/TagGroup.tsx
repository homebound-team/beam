import { Button } from "src/components/Button";
import { IconKey } from "src/components/Icon";
import { Tag } from "src/components/Tag";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";

export type TagGroupItem = {
  text: string;
  preventTooltip?: boolean;
} & ({ iconOnly?: false; icon?: IconKey } | { iconOnly: true; icon: IconKey });

export type TagGroupProps = {
  tags: TagGroupItem[];
  /** When set, renders a trailing "Edit" control. Function → button; string → link href. */
  onEdit?: string | VoidFunction;
};

/** Renders a wrapping list of secondary tags with an optional Edit control. */
export function TagGroup(props: TagGroupProps) {
  const { tags, onEdit, ...otherProps } = props;
  const tid = useTestIds(otherProps, "tagGroup");

  return (
    <div {...tid} css={Css.df.aic.fww.gap1.$}>
      {tags.map((tag) => (
        <Tag key={tag.text} {...tag} variant="secondary" />
      ))}
      {onEdit && (
        <span css={Css.ml1.sm.$}>
          <Button label="Edit" variant="text" onClick={onEdit} {...tid.edit} />
        </span>
      )}
    </div>
  );
}
