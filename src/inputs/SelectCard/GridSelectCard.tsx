import { VisuallyHidden } from "react-aria";
import { Icon, IconProps } from "src/components";
import { Css, Tokens } from "src/Css";
import { SelectCardShell } from "src/inputs/SelectCard/SelectCardShell";
import { SelectCardItemProps } from "src/inputs/SelectCard/types";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type GridSelectCardProps = SelectCardItemProps & {
  icon: IconProps["icon"];
};

/** Internal grid-view card with icon and optional description. Used by select card groups. */
export function GridSelectCard(props: GridSelectCardProps) {
  const {
    icon,
    label,
    description,
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
      __storyState={__storyState}
      {...others}
    >
      <VisuallyHidden>
        <input {...inputProps} {...tid.value} />
      </VisuallyHidden>
      <Icon icon={icon} inc={4} color={isDisabled ? Tokens.OnSurfaceDisabled : Tokens.OnSurface} />
      <span css={Css.df.fdc.gap("4px").w100.$}>
        <span css={Css.smSb.if(isDisabled).gray600.$}>{label}</span>
        {description && <span css={Css.xs.color(Tokens.OnSurface).if(isDisabled).gray600.$}>{description}</span>}
      </span>
    </SelectCardShell>
  );
}
