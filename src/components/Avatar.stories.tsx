import { Meta } from "@storybook/react";
import { Avatar, AvatarSize } from "src/components/Avatar";
import { Css } from "src/Css";

export default {
  component: Avatar,
  title: "Workspace/Components/Avatar",
} as Meta;

export function Examples() {
  const sizes = ["sm", "md", "lg", "xl"] as AvatarSize[];
  return (
    <div css={Css.df.fdc.gap2.$}>
      <h1>Working image</h1>
      <div css={Css.df.gap2.$}>
        {sizes.map((size) => (
          <Avatar src="captain-marvel.jpg" size={size} name="Carol Danvers" />
        ))}
      </div>

      <h1>Image load error</h1>
      <div css={Css.df.gap2.$}>
        {sizes.map((size) => (
          <Avatar src="failing-image-url.jpg" size={size} name="Carol Danvers" />
        ))}
      </div>

      <h1>Explicitly undefined</h1>
      <div css={Css.df.gap2.$}>
        {sizes.map((size) => (
          <Avatar src={undefined} size={size} name="Carol Middle Danvers" />
        ))}
      </div>

      <h1>With name</h1>
      <div css={Css.df.gap2.aifs.$}>
        {sizes.map((size) => (
          <Avatar src="captain-marvel.jpg" size={size} name="Carol Danvers" showName />
        ))}
      </div>
    </div>
  );
}
