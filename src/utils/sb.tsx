import type { Decorator, StoryObj } from "@storybook/react-vite";
import type { JSX, ReactNode } from "react";
import { BeamProvider } from "src/components/BeamContext";
import { Css, type Properties } from "src/Css";
import { documentScrollBodyMinHeight } from "src/layouts/layoutVars";
import { withRouter as rtlWithRouter } from "src/utils/rtl";
import type { MINIMAL_VIEWPORTS } from "storybook/viewport";

/** Storybook viewport keys: `mobile1` (Small mobile), `mobile2` (Large mobile), `tablet`, `desktop`. */
export type StorybookViewportKey = keyof typeof MINIMAL_VIEWPORTS;

export function withRouter(url?: string, route?: string): Decorator {
  return (Story: () => JSX.Element) => rtlWithRouter(url, route).wrap(<Story />);
}

/** Return type of {@link viewportModes}; keys must be Beam Storybook viewport names. */
export type ChromaticViewportModes<T extends StorybookViewportKey = StorybookViewportKey> = Record<T, { viewport: T }>;

/** Parameters supported by {@link newStory} and our story conventions. */
export type StoryParameters = {
  layout?: "centered" | "fullscreen" | "padded" | "none";
  chromatic?: {
    delay?: number;
    modes?: Partial<ChromaticViewportModes>;
  };
  mockData?: unknown;
  controls?: { include?: string[]; exclude?: string | string[] };
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
  argTypes?: Record<string, object>;
};

/**
 * Chromatic modes that reference Beam Storybook viewports by key
 * (`mobile1` Small mobile, `mobile2` Large mobile, `tablet`, `desktop`).
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

export type LabeledExample = {
  label: string;
  children: ReactNode;
};

/** Labeled examples for one story. `column` stacks the label above; `row` places it beside. */
export function LabeledExamples(props: {
  examples: LabeledExample[];
  /** `row` is the label beside the example. `column` is the label above it. */
  direction?: "row" | "column";
  labelWidth?: number;
  exampleWidth?: number;
}) {
  const { examples, direction = "row", labelWidth = 72, exampleWidth } = props;
  const stacked = direction === "column";
  return (
    <div css={Css.bgWhite.p2.df.fdc.gap2.if(!stacked).aifs.if(stacked).w100.$}>
      {examples.map((example) => (
        <div
          key={example.label}
          css={stacked ? Css.df.fdc.gap1.w100.$ : exampleWidth ? Css.df.gap2.$ : Css.df.aic.gap2.$}
        >
          <span css={stacked ? Css.xs.gray600.$ : Css.xs.gray600.fs0.wPx(labelWidth).if(!!exampleWidth).ptPx(12).$}>
            {example.label}
          </span>
          {exampleWidth ? <div css={Css.wPx(exampleWidth).$}>{example.children}</div> : example.children}
        </div>
      ))}
    </div>
  );
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

/** Paints `aiBackground` behind a story so AI surfaces can be previewed outside {@link StepperLayout} / {@link FocusedFormLayout}. */
export const withAiBackground: Decorator = (Story) => (
  <div css={Css.aiBackground.mh(documentScrollBodyMinHeight()).$}>
    <Story />
  </div>
);
