import { Meta } from "@storybook/react-vite";
import { AvatarButton, AvatarButtonProps } from "src/components/Avatar/AvatarButton";
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
        "__storyState",
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
          <FocusedAvatarButton {...props} />
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
  return <AvatarButton {...props} __storyState={{ hovered: true }} />;
}

/** Focused styled version of the AvatarButton */
function FocusedAvatarButton(props: AvatarButtonProps) {
  return <AvatarButton {...props} __storyState={{ focusVisible: true }} />;
}

/** Pressed styled version of the AvatarButton */
function PressedAvatarButton(props: AvatarButtonProps) {
  return <AvatarButton {...props} __storyState={{ pressed: true }} />;
}
