import { Parameters, StoryFn } from "@storybook/addons";
import { configure } from "mobx";
import { CssReset } from "../src";
import beamTheme from "./beamTheme";

// formState doesn't use actions
configure({ enforceActions: "never" });

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters: Parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: "^on.*" },
  options: {
    // https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#sorting-stories
    storySort: { order: ["Intro", "Foundations", "Catalog", "Design QA", "Workspace"] },
  },
  // https://storybook.js.org/docs/react/essentials/backgrounds
  backgrounds: {
    values: [
      { name: "light", value: "#F8F8F8" },
      // Adding this to help view with off white hover states
      { name: "white", value: "#FFF" },
      { name: "dark", value: "rgba(53,53,53,1)" },
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
  docs: { theme: beamTheme },
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
