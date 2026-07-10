import { Meta } from "@storybook/react-vite";
import { Breadcrumb } from "src/components/Breadcrumbs";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { Option1CompactOnAutoHide } from "./Option1CompactOnAutoHide";
import { Option2SnapCollapseToBreadcrumbs } from "./Option2SnapCollapseToBreadcrumbs";
import { Option3ProgressiveShrink } from "./Option3ProgressiveShrink";

/**
 * SPIKE (DS-154): rough scroll-behavior prototypes for the PageHeader, for design review
 * only. None of this is wired into the real `PageHeader`/`PageHeaderLayout`/
 * `useAutoHideOnScroll` — see `src/spikes/PageHeaderScrollBehavior/` for the throwaway
 * implementations backing each story below.
 */
export default {
  title: "Spikes/DS-154 PageHeader Scroll Behavior",
  parameters: { layout: "fullscreen" },
  decorators: [withRouter(), withBeamDecorator],
} as Meta;

const breadcrumbs: Breadcrumb[] = [
  { label: "Projects", href: "" },
  { label: "123 Main St", href: "" },
  { label: "Change Orders", href: "" },
];

/**
 * Option 1 — compact bar replaces the "hidden" state.
 * Scroll down: the full header slides up out of view like it does today, then a compact
 * breadcrumbs + rightSlot bar fades and slides in, pinned to the top. Scroll up from
 * anywhere on the page: the compact bar disappears and the full header slides back in.
 */
export function Option1_CompactOnAutoHide() {
  return (
    <Option1CompactOnAutoHide
      pageHeader={{
        title: "123 Main St",
        breadcrumbs: { breadcrumbs },
        rightSlot: <Button label="Action" onClick={() => {}} />,
      }}
    >
      <Body />
    </Option1CompactOnAutoHide>
  );
}

/** Same as above, but the compact bar omits rightSlot entirely once scrolled. */
export function Option1_CompactOnAutoHide_NoRightSlot() {
  return (
    <Option1CompactOnAutoHide
      hideRightSlotOnScroll
      pageHeader={{
        title: "123 Main St",
        breadcrumbs: { breadcrumbs },
        rightSlot: <Button label="Action" onClick={() => {}} />,
      }}
    >
      <Body />
    </Option1CompactOnAutoHide>
  );
}

/**
 * Option 2 — distance-triggered snap-collapse, always sticky.
 * The header never slides away; it stays pinned to the top the whole time. Once you
 * scroll down past ~160px the breadcrumbs row smoothly shrinks away, leaving the page
 * title solo alongside rightSlot; any upward scroll — from anywhere on the page — smoothly
 * re-expands the breadcrumbs.
 */
export function Option2_SnapCollapseToBreadcrumbs() {
  return (
    <Option2SnapCollapseToBreadcrumbs
      pageHeader={{
        title: "123 Main St",
        breadcrumbs: { breadcrumbs },
        rightSlot: <Button label="Action" onClick={() => {}} />,
      }}
    >
      <Body />
    </Option2SnapCollapseToBreadcrumbs>
  );
}

/** Same as above, but the condensed strip omits rightSlot entirely once collapsed. */
export function Option2_SnapCollapseToBreadcrumbs_NoRightSlot() {
  return (
    <Option2SnapCollapseToBreadcrumbs
      hideRightSlotOnScroll
      pageHeader={{
        title: "123 Main St",
        breadcrumbs: { breadcrumbs },
        rightSlot: <Button label="Action" onClick={() => {}} />,
      }}
    >
      <Body />
    </Option2SnapCollapseToBreadcrumbs>
  );
}

/**
 * Option 3 — progressive/continuous shrink (extra idea).
 * The header stays pinned to the top and never swaps layouts. Scrolling down accumulates
 * up to ~120px of "collapse budget," smoothly shrinking the title and tightening the
 * header's padding; scrolling up spends that budget back down at the same rate, from
 * anywhere on the page, rather than snapping between two states like Options 1 and 2.
 */
export function Option3_ProgressiveShrink() {
  return (
    <Option3ProgressiveShrink
      pageHeader={{
        title: "123 Main St",
        breadcrumbs: { breadcrumbs },
        rightSlot: <Button label="Action" onClick={() => {}} />,
      }}
    >
      <Body />
    </Option3ProgressiveShrink>
  );
}

/**
 * Same as above, but rightSlot fades out across the same collapse progress instead of a
 * hard cutoff — there's no discrete "scrolled state" here to snap it away at. A hard
 * cutoff at some progress threshold is a reasonable alternative if design prefers that.
 */
export function Option3_ProgressiveShrink_NoRightSlot() {
  return (
    <Option3ProgressiveShrink
      hideRightSlotOnScroll
      pageHeader={{
        title: "123 Main St",
        breadcrumbs: { breadcrumbs },
        rightSlot: <Button label="Action" onClick={() => {}} />,
      }}
    >
      <Body />
    </Option3ProgressiveShrink>
  );
}

function Body() {
  return (
    <div css={Css.px3.py2.$}>
      {zeroTo(30).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </div>
  );
}
