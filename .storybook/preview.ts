import { Parameters } from "@storybook/addons";

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
    values: [{ name: "light", value: "#F8F8F8" }],
    // Defaulting to an off white to better see the color palette
    default: "light",
  },
};

// https://storybook.js.org/docs/react/writing-stories/decorators#global-decorators
export const decorators = [];
