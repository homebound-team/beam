import { Meta } from "@storybook/react";
import { AvatarGroup, AvatarGroupProps } from "src/components/Avatar/AvatarGroup";
import { Css } from "src/Css";

export default {
  component: AvatarGroup,
} as Meta<AvatarGroupProps>;

export function Examples() {
  const avatars = [
    { src: "captain-marvel.jpg", name: "Carol Danvers" },
    { name: "Iron man", src: "tony-stark.jpg" },
    { name: "Captain Marvel", src: "captain-marvel.jpg" },
    { name: "Captain America", src: "captain-america.jpg" },
    { name: "Thor", src: "thor.jpg" },
    { name: "Black Widow", src: "/black-widow.jpg" },
    { name: "Captain Marvel", src: "captain-marvel.jpg" },
    { name: "Captain America", src: "captain-america.jpg" },
    { name: "Thor", src: "thor.jpg" },
    { name: "Black Widow", src: "/black-widow.jpg" },
  ];

  return (
    <div css={Css.df.fdc.gap4.$}>
      <h1>With Images</h1>
      <AvatarGroup avatars={avatars} size="sm" />
      <AvatarGroup avatars={avatars} size="md" />
      <AvatarGroup avatars={avatars} size="lg" />
      <AvatarGroup avatars={avatars} size="xl" />

      <h1>Without Images</h1>
      <AvatarGroup avatars={avatars.map((a) => ({ ...a, src: undefined }))} size="md" />

      <h1>Without Names</h1>
      <AvatarGroup avatars={avatars.map((a) => ({ name: undefined, src: undefined }))} size="md" />
    </div>
  );
}
