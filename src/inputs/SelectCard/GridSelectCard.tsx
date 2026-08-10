import { VisuallyHidden } from "react-aria";
import { Icon, IconProps, Tag } from "src/components";
import { Css, Tokens } from "src/Css";
import { SelectCardShell } from "src/inputs/SelectCard/SelectCardShell";
import { SelectCardItemProps, SelectCardLayout } from "src/inputs/SelectCard/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type GridSelectCardProps = SelectCardItemProps & {
  icon?: IconProps["icon"];
  /** Image url shown in place of the icon. */
  image?: string;
  /** Icon above the text (default) or to its left. */
  layout?: SelectCardLayout;
};

/** Internal grid-view card with icon or image and optional description. Used by select card groups. */
export function GridSelectCard(props: GridSelectCardProps) {
  const {
    icon,
    image,
    layout,
    label,
    description,
    tag,
    selected: isSelected = false,
    disabled: isDisabled = false,
    tooltip,
    inputProps,
    __storyState,
    ...others
  } = props;

  const tid = useTestIds(props, defaultTestId(label));

  return (
    <SelectCardShell
      label={label}
      selected={isSelected}
      disabled={isDisabled}
      tooltip={tooltip}
      view="grid"
      layout={layout}
      __storyState={__storyState}
      {...others}
    >
      <VisuallyHidden>
        <input {...inputProps} {...tid.value} />
      </VisuallyHidden>
      {image ? (
        <img src={image} alt="" css={Css.sqPx(100).objectContain.fs0.if(isDisabled).o50.$} {...tid.img} />
      ) : (
        icon && <Icon icon={icon} inc={4} color={isDisabled ? Tokens.OnSurfaceDisabled : Tokens.OnSurface} />
      )}
      <span css={Css.df.fdc.gap("4px").w100.$}>
        {tag && (
          <span css={Css.df.if(layout !== "horizontal").jcc.if(isDisabled).o50.$}>
            <Tag type={tag.type} text={tag.text} {...tid.tag} />
          </span>
        )}
        <span css={Css.smSb.if(isDisabled).color(Tokens.FieldTextDisabled).$}>{label}</span>
        {description && (
          <span css={Css.sm.color(Tokens.OnSurface).if(isDisabled).color(Tokens.FieldTextDisabled).$}>
            {description}
          </span>
        )}
      </span>
    </SelectCardShell>
  );
}
