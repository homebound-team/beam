import { createMuiTheme } from '@material-ui/core';
import { Css, Palette } from './Css';

const { Black, White, Red, RedLight, RedDark } = Palette;

export const GoodSansRegular = {
  fontFamily: 'Good Sans',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
      local('Good Sans'),
      local('Good Sans-Regular'),
      url(/fonts/goodsans-regular.woff2) format('woff2')
  `,
  unicodeRange:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF',
};

export const muiTheme = {
  themeName: 'muiTheme',
  ...createMuiTheme({
    palette: {
      primary: {
        main: Black,
        contrastText: White,
      },

      error: {
        light: RedLight,
        main: Red,
        dark: RedDark,
        contrastText: White,
      },
      background: {
        default: White,
      },
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
    shape: {
      borderRadius: 25,
    },
    typography: Css.sansSerif.$,
  }),
};

muiTheme.overrides = {
  MuiCssBaseline: {
    '@global': {
      // Setting this to ignore because the @font-face isn't allowed but should be
      // @ts-ignore
      '@font-face': [GoodSansRegular],
    },
  },
  MuiMenuItem: {
    // Make select box items the right font/color.
    root: Css.t16.black.$,
  },
  MuiDrawer: {
    paperAnchorDockedLeft: {
      borderRight: 0,
    },
  },
  MuiPaper: {
    elevation8: Css.shadowHover.$,
  },
  MuiList: {
    root: {
      padding: 0,
      '&:focus': {
        outline: 'none',
      },
    },
    padding: Css.py0.$,
  },
  MuiDialog: {
    container: Css.cursorPointer.$,
    paper: { cursor: 'auto' },
  },
};

export const globalStyles = {
  '*': {
    ...Css.sansSerif.$,
    fontWeight: GoodSansRegular.fontWeight,
    fontStyle: GoodSansRegular.fontStyle,
    fontDisplay: GoodSansRegular.fontDisplay,
  },
  darkScrollbar: {
    /* Scrollbar styles for Firefox */
    scrollbarWidth: 6,
    scrollbarColor: '#000 #fff',
  },
  /* Scrollbar styles for Chrome, Edge and Safari */
  '.darkScrollbar::-webkit-scrollbar': {
    ...Css.bgWhite.$,
    width: 6 /* For vertical scrollbar */,
    height: 6 /* For horizontal scrollbar */,
  },
  '.darkScrollbar::-webkit-scrollbar-track': Css.bgWhite.$,
  '.darkScrollbar::-webkit-scrollbar-thumb': Css.br5.bgBlack.$,
  // TODO: Does this need to be here?
  'h1, h2, h3, h4, h5, h6, p, hr': Css.m0.$,
  /** Hide arrows from number inputs https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp **/
  /* Chrome, Safari, Edge, Opera */
  // TODO: Should this be here?
  'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
    ...Css.m0.$,
    '-webkit-appearance': 'none',
  },
  /* Firefox */
  'input[type=number]': {
    '-moz-appearance': 'textfield',
  },
};
