import { SuperDrawerProvider } from "./SuperDrawerContext";

/** Storybook utility to wrap a story with a SuperDrawer context */
export const withSuperDrawer = (Story: () => JSX.Element) => (
  <SuperDrawerProvider>
    <Story />
  </SuperDrawerProvider>
);
