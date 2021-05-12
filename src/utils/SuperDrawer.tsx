import { Wrapper } from "@homebound/rtl-utils";
import { SuperDrawerProvider } from "../components/SuperDrawerContext";

/** Storybook decorator utility to wrap a story with a SuperDrawer context */
export const withDecoratorSuperDrawer = (Story: () => JSX.Element) => (
  <SuperDrawerProvider>
    <Story />
  </SuperDrawerProvider>
);

/** RTL wrapper for SuperDrawer context */
export const withSuperDrawer: Wrapper = {
  wrap: (c) => <SuperDrawerProvider>{c}</SuperDrawerProvider>,
};
