import { Preview } from "@storybook/react-vite";
import { configure } from "mobx";
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from "storybook/viewport";
import { CssReset } from "../src";
import beamTheme from "./beamTheme";

// formState doesn't use actions
configure({ enforceActions: "never" });

const preview: Preview = {
  parameters: {
    // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
    actions: { argTypesRegex: "^on.*" },
    options: {
      // https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#sorting-stories
      storySort: { order: ["Intro", "Foundations", "Inputs", "Components", "Forms"] },
    },
    // https://storybook.js.org/docs/react/essentials/backgrounds
    backgrounds: {
      options: {
        light: { name: "light", value: "#F8F8F8" },

        // Adding this to help view with off-white hover states
        white: { name: "white", value: "#FFF" },

        dark: { name: "dark", value: "rgba(53,53,53,1)" },
      },
    },
    chromatic: {
      // Delaying Chromatic to allow animations to run
      // https://www.chromatic.com/docs/delay#delay-a-story
      delay: 300,
    },
    // Catalog of named viewports so per-story `chromatic.modes` (via `viewportModes(...)`) can
    // reference them by key. This only registers the names — it does not add snapshots; multi-viewport
    // capture stays opt-in per story. No `initialGlobals.viewport`, so non-moded stories are unaffected.
    viewport: { options: { ...INITIAL_VIEWPORTS, ...MINIMAL_VIEWPORTS } },
    controls: {
      // Hide NoControls warning
      // https://storybook.js.org/docs/react/essentials/controls#hide-nocontrols-warning
      hideNoControlsWarning: true,
    },
    docs: { theme: beamTheme },
  },

  decorators: [
    (Story) => {
      return (
        <>
          <CssReset />
          <Story />
        </>
      );
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: "light",
    },
  },
};

export default preview;
