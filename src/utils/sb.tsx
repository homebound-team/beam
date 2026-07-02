import { type Decorator, type StoryObj } from "@storybook/react-vite";
import { ReactNode } from "react";
import { BeamOverlays, BeamProvider } from "src/components";
import { Css, Properties } from "src/Css";
import { withRouter as rtlWithRouter } from "src/utils/rtl";
import type { InitialViewportKeys, MINIMAL_VIEWPORTS } from "storybook/viewport";

/** Built-in Storybook viewport keys from {@link MINIMAL_VIEWPORTS} and {@link INITIAL_VIEWPORTS}. */
export type StorybookViewportKey = InitialViewportKeys | keyof typeof MINIMAL_VIEWPORTS;

export function withRouter(url?: string, route?: string): Decorator {
  return (Story: () => JSX.Element) => rtlWithRouter(url, route).wrap(<Story />);
}

/** Return type of {@link viewportModes}; keys must be built-in Storybook viewport names. */
export type ChromaticViewportModes<T extends StorybookViewportKey = StorybookViewportKey> = Record<T, { viewport: T }>;

/** Parameters supported by {@link newStory} and our story conventions. */
export type StoryParameters = {
  layout?: "centered" | "fullscreen" | "padded" | "none";
  chromatic?: {
    delay?: number;
    modes?: Partial<ChromaticViewportModes>;
  };
  mockData?: unknown;
};
type PlayFunction = NonNullable<StoryObj["play"]>;

/** Options supported by {@link newStory}. */
export type StoryOptions<TArgs = Record<string, unknown>> = {
  parameters?: StoryParameters;
  decorators?: Decorator[];
  play?: PlayFunction;
  globals?: {
    backgrounds?: {
      value?: string;
    };
  };
  args?: Partial<TArgs>;
};

/**
 * Chromatic modes that reference built-in Storybook viewports by key
 * (see [Storybook viewports](https://storybook.js.org/docs/essentials/viewport)).
 * https://www.chromatic.com/docs/modes/viewports/
 */
export function viewportModes<const T extends StorybookViewportKey>(...viewports: T[]): ChromaticViewportModes<T> {
  return Object.fromEntries(viewports.map((viewport) => [viewport, { viewport }])) as ChromaticViewportModes<T>;
}

/**
 * Attach story metadata (args, decorators, play, etc.) when defining a CSF3 story export.
 * Prefer passing options here over mutating `.args` on the export afterward.
 */
export function newStory<TFn extends Function>(storyFn: TFn, opts: StoryOptions): TFn {
  const story = ((...args: unknown[]) => storyFn(...args)) as unknown as TFn;
  Object.assign(story, opts);
  return story;
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

/** Storybook decorator: BeamProvider + BeamOverlays (see docs/overlays.md). */
export const withBeamDecorator: Decorator = (Story) => (
  <BeamProvider>
    <Story />
    <BeamOverlays />
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
