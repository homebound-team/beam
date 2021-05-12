import { StoryFn } from "@storybook/addons";
import { DecoratorFn } from "@storybook/react";
import { ReactElement, ReactNode } from "react";
import { SuperDrawerProvider } from "src";
import { Css } from "src/Css";
import { withRouter as rtlWithRouter } from "src/utils/rtl";

export function withRouter(url?: string, path?: string): DecoratorFn {
  return (storyFn: StoryFn<ReactElement>) => rtlWithRouter(url, path).wrap(storyFn());
}

/* Models our currently used parameters. */
type StoryParameters = { chromatic?: { delay?: number }; mockData?: unknown };

/** A somewhat typesafe way to set `FooStory.story` metadata. */
export function newStory(
  storyFn: Function,
  opts: {
    parameters?: StoryParameters;
    decorators?: DecoratorFn[];
  },
): Function {
  Object.assign(storyFn, opts);
  return storyFn;
}

/** Renders a number of small samples within a single story. */
export function samples(...samples: [string, ReactNode][]): JSX.Element[] {
  return samples.map((s, i) => {
    return (
      <div key={i} css={Css.my(8).$}>
        <div css={Css.my1.$}>{s[0]}</div>
        {s[1]}
      </div>
    );
  });
}

/** Storybook decorator utility to wrap a story with a SuperDrawer context */
export const withSuperDrawer = (Story: () => JSX.Element) => (
  <SuperDrawerProvider>
    <Story />
  </SuperDrawerProvider>
);
