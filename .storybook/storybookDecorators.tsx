import { StoryFn } from "@storybook/addons";
import { CssReset } from "src/components/CssReset";

export const withReset: StoryFn = (storyFn: any) => {
  return (
    <>
      <CssReset />
      {storyFn()}
    </>
  );
};
