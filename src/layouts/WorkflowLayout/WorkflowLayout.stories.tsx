import { Meta } from "@storybook/react-vite";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Breakpoints, Css } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { newStory, viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TableExample } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { waitFor, within } from "storybook/test";
import { WorkflowLayout, WorkflowLayoutStep } from "./WorkflowLayout";

export default {
  component: WorkflowLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

export function Default() {
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      onSaveAndExit={action("save and exit clicked")}
      steps={makeSteps()}
    />
  );
}

/**
 * Tall step content so the page scrolls. On mobile the tabs are always collapsed; on desktop, the
 * `play` function scrolls down to show them collapse to their condensed look (the header itself stays
 * pinned; it never auto-hides). Scroll back up from there (even without reaching the top) to see them
 * re-expand.
 */
export const ScrollCollapsesTabs = newStory(
  () => (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      steps={makeSteps(50)}
    />
  ),
  {
    // The tabs' collapse is a 200ms CSS transition (see StepperTab's `transitionAll`) — the play function
    // below only waits for the shrink to begin, so give Chromatic a little extra time past that before it
    // snapshots, to capture the fully-settled collapsed state rather than a mid-transition frame.
    parameters: { chromatic: { delay: 1000 } },
    play: async ({ canvasElement }) => {
      // On mobile (e.g. the `mobile1` Chromatic mode) the tabs are already collapsed on mount — scrolling
      // wouldn't shrink them any further, so the height-shrinks wait below would never resolve.
      if (window.matchMedia(Breakpoints.sm.replace("@media ", "")).matches) return;

      const header = within(canvasElement).getByTestId("workflowLayout_header");
      const expandedHeight = header.getBoundingClientRect().height;
      window.scrollTo({ top: 800 });
      await waitFor(() => {
        if (header.getBoundingClientRect().height >= expandedHeight) {
          throw new Error("Waiting for the stepper tabs to collapse on scroll");
        }
      });
    },
  },
);

/**
 * A step whose content is a wide table — it overflows horizontally instead of shrinking to fit the
 * viewport. Most visible at the `mobile1` Chromatic viewport, or by resizing the window below 600px.
 */
export function WideStepContentOverflows() {
  const steps = makeSteps();
  steps[0] = { ...steps[0], content: <TableExample numCols={10} numRows={20} /> };
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      steps={steps}
    />
  );
}

/**
 * A step whose content leads with a `ContentHeader` above a wide table. Scroll the page horizontally
 * (most visible at the `mobile1` Chromatic viewport, or by resizing the window below 600px) — the table
 * scrolls away, but `ContentHeader` stays pinned to the visible left/right edges since it only sticks
 * horizontally (it has no `top` set, so it still scrolls away normally on the vertical axis).
 *
 * The wrapping div needs `mw("fit-content")` for this to work — `ContentHeader`'s sticky positioning
 * has no "room" to operate unless its containing block is at least as wide as the table's full content
 * width (see the doc comment on `ContentHeader` itself), the same technique `GridTable` uses internally.
 */
export function WideContentWithContentHeader() {
  const steps = makeSteps();
  steps[0] = {
    ...steps[0],
    content: (
      <div css={Css.df.fdc.gap2.pt3.$}>
        <ContentHeader
          title="Trade Partners"
          description="Sticky to the left/right document-scroll bounds, but scrolls away vertically."
          actions={[{ label: "Add", onClick: action("add clicked") }]}
        />
        <TableExample numCols={10} numRows={20} />
      </div>
    ),
  };
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      steps={steps}
    />
  );
}

/**
 * `WorkflowLayout` nested under `EnvironmentBannerLayout` with a banner actually displayed, pushing the
 * whole layout down by `environmentBannerSizePx`. Tall step content so the page scrolls — sanity check
 * that the header renders correctly in that composed position and stays pinned while scrolling. The
 * stepper-tabs scroll-collapse threshold correctly accounts for the banner's height here, since it's
 * plain arithmetic rather than a measured DOM anchor.
 */
export function Composed() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <WorkflowLayout
        title="Workflow Layout"
        onCancel={action("cancel clicked")}
        completeLabel="Save"
        onComplete={action("complete clicked")}
        steps={makeSteps(50)}
      />
    </EnvironmentBannerLayout>
  );
}

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeSteps(contentRows = 0): WorkflowLayoutStep[] {
  return tabValues.map((value) => ({
    label: tabLabels[value],
    completed: false,
    content: <StepContent title={tabLabels[value]} numRows={contentRows} />,
  }));
}

function StepContent({ title, numRows = 0 }: { title: string; numRows?: number }) {
  return (
    <div css={Css.p3.$}>
      <h1 css={Css.xl2.mb2.$}>{title}</h1>
      <div css={Css.df.fdc.gap1.$}>
        {zeroTo(numRows).map((i) => (
          <div key={i} css={Css.hPx(48).br4.bgGray100.df.aic.pl2.$}>
            Row {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
