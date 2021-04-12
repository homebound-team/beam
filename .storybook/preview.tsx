import { Parameters, StoryFn } from "@storybook/addons";
import { CssReset } from "../src";

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters: Parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: "^on.*" },
  options: {
    // https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#sorting-stories
    storySort: {
      method: "alphabetical",
      order: ["Foundations", "Components"],
    },
  },
  // https://storybook.js.org/docs/react/essentials/backgrounds
  backgrounds: {
    values: [
      { name: "light", value: "#F8F8F8" },
      // Adding this to help view with off white hover states
      { name: "white", value: "#FFF" },
    ],
    // Defaulting to an off white to better see the color palette
    default: "light",
  },
  chromatic: {
    // Delaying Chromatic to allow animations to run
    // https://www.chromatic.com/docs/delay#delay-a-story
    delay: 300,
  },
  controls: {
    // Hide NoControls warning
    // https://storybook.js.org/docs/react/essentials/controls#hide-nocontrols-warning
    hideNoControlsWarning: true,
  },
};

// https://storybook.js.org/docs/react/writing-stories/decorators#global-decorators
export const decorators = [withReset];

function withReset(storyFn: StoryFn) {
  return (
    <>
      <CssReset />
      {storyFn()}
    </>
  );
}
