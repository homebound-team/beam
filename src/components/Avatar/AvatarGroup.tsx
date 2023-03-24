import { Avatar, AvatarSize } from "src/components/Avatar/Avatar";
import { ButtonModal } from "src/components/ButtonModal";
import { Css } from "src/Css";

export interface AvatarGroupProps {
  avatars: { src: string | undefined; name?: string }[];
  size?: AvatarSize;
}

export function AvatarGroup(props: AvatarGroupProps) {
  const { avatars, size = "md" } = props;

  // If there are 8 or fewer avatars, show them all. Otherwise, show the first 7 and a menu with the rest.
  const maxVisibleAvatars = avatars.length <= 8 ? 8 : 7;
  const visibleAvatars = avatars.slice(0, maxVisibleAvatars);
  const menuAvatars = avatars.slice(maxVisibleAvatars);

  return (
    <div css={Css.df.aic.gap1.xsSb.$}>
      <div css={Css.df.aic.$}>
        {visibleAvatars.map((avatar, idx) => (
          <div
            key={avatar.src ?? idx}
            css={
              Css.br100.ba.bWhite
                .add("borderWidth", "3px")
                .if(idx > 0)
                .mlPx(-1 * sizeToOverlap[size]).$
            }
          >
            <Avatar src={avatar.src} name={avatar.name} size={size} />
          </div>
        ))}
      </div>
      {menuAvatars.length > 0 && (
        <ButtonModal
          trigger={{ label: `+ ${menuAvatars.length} more`, variant: "text" }}
          hideEndAdornment
          content={
            <div css={Css.df.fdc.gap1.mPx(-12).$}>
              {menuAvatars.map((a, idx) => (
                <Avatar key={a.src ?? idx} src={a.src} name={a.name} showName size="md" />
              ))}
            </div>
          }
        />
      )}
    </div>
  );
}

const sizeToOverlap: Record<AvatarSize, number> = {
  sm: 9,
  md: 9,
  lg: 15,
  xl: 22,
};
