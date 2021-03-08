import { Parameters } from '@storybook/addons';

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters: Parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
  options: {
    // https://storybook.js.org/docs/react/writing-stories/naming-components-and-hierarchy#sorting-stories
    storySort: {
      method: 'alphabetical',
      /**
       * TODO: Order stories via some sort of hierarchy (`atoms`, `molecules`, `organism`)
       * https://atomicdesign.bradfrost.com/chapter-2/
       */
      // order: []
    },
  },
};

// https://storybook.js.org/docs/react/writing-stories/decorators#global-decorators
export const decorators = [];
