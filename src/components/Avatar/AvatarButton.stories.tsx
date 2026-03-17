import { Meta } from "@storybook/react-vite";
import { AvatarButton, AvatarButtonProps, hoverStyles } from "src/components/Avatar/AvatarButton";
import { Css } from "src/Css";
import { action } from "storybook/actions";

export default {
  component: AvatarButton,
  args: {
    onClick: action("onClick"),
    src: "captain-marvel.jpg",
    name: "Carol Danvers",
  },
  parameters: {
    controls: {
      exclude: [
        "src",
        "onClick",
        "name",
        "menuTriggerProps",
        "buttonRef",
        "disabled",
        "tooltip",
        "openInNew",
        "autoFocus",
        "forcePressedStyles",
      ],
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=31578%3A99818",
    },
  },
} as Meta<AvatarButtonProps>;

export function Examples(props: AvatarButtonProps) {
  return (
    <div>
      <h1 css={Css.xl2.mbPx(30).$}>Avatar Button</h1>
      <div css={Css.df.gapPx(90).$}>
        <div>
          <h2>Default</h2>
          <AvatarButton {...props} />
        </div>
        <div>
          <h2>Hover</h2>
          <HoveredAvatarButton {...props} />
        </div>
        <div>
          <h2>Focused</h2>
          <AvatarButton {...props} autoFocus />
        </div>
        <div>
          <h2>Disabled</h2>
          <AvatarButton {...props} disabled="Disabled reason" />
        </div>
        <div>
          <h2>Pressed</h2>
          <PressedAvatarButton {...props} />
        </div>
      </div>
    </div>
  );
}
/** Hover styled version of the AvatarButton */
function HoveredAvatarButton(props: AvatarButtonProps) {
  return (
    <div css={{ "& button": hoverStyles }}>
      <AvatarButton {...props} />
    </div>
  );
}

/** Pressed styled version of the AvatarButton */
function PressedAvatarButton(props: AvatarButtonProps) {
  return <AvatarButton {...props} forcePressedStyles />;
}
