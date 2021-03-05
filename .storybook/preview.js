import React from 'react';
import { Global, css } from '@emotion/react';
import { muiTheme, globalStyles } from '../';
import { StylesProvider, ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import '../src/tailwind/tailwind.css';

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
  options: {
    // Order stories in alphabetical order
    storySort: (a, b) => (a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true })),
  },
};

// https://storybook.js.org/docs/react/writing-stories/decorators#global-decorators
export const decorators = [
  (Story) => (
    // injects MUI styles first, so emotion styles will override them
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={muiTheme}>
        <Global
          styles={css`
            ${globalStyles}
          `}
        />
        <CssBaseline />
        <Story />
      </MuiThemeProvider>
    </StylesProvider>
  ),
];
