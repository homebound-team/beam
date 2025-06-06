import { Decorator, ReactRenderer } from "@storybook/react";
import { type PlayFunction as PlayFunctionType } from "@storybook/types";
import { ReactNode } from "react";
import { BeamProvider } from "src/components";
import { Css, Properties } from "src/Css";
import { withRouter as rtlWithRouter } from "src/utils/rtl";

export function withRouter(url?: string): Decorator {
  return (Story: () => JSX.Element) => rtlWithRouter(url).wrap(<Story />);
}

/* Models our currently used parameters. */
type StoryParameters = { chromatic?: { delay?: number }; mockData?: unknown };
type PlayFunction = PlayFunctionType<ReactRenderer>;

/** A somewhat typesafe way to set `FooStory.story` metadata. */
export function newStory(
  storyFn: Function,
  opts: {
    parameters?: StoryParameters;
    decorators?: Decorator[];
    play?: PlayFunction;
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

export function zeroTo(n: number): number[] {
  return [...Array(n).keys()];
}

/** Storybook decorator utility to wrap a story with a SuperDrawer context */
export const withBeamDecorator: Decorator = (Story) => (
  <BeamProvider>
    <Story />
  </BeamProvider>
);

/**
 * Decorator to set explicit width and height dimensions for a story.
 * Used to help Chromatic properly render positioned `fixed` components.
 */
export const withDimensions =
  (width: number | string = "100vw", height: number | string = "100vh", xss?: Properties) =>
  (Story: () => JSX.Element) => (
    <div css={{ ...Css.w(width).h(height).$, ...xss }}>
      <Story />
    </div>
  );
