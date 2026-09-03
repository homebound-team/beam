import { JumpLink } from "src/components/JumpLink";
import { Css } from "src/Css";
import { centeredShellMaxPx } from "src/layouts/CenteredLayout/CenteredLayout";
import { useTestIds } from "src/utils";
import { stickyNavAndHeaderOffset } from "../layoutVars";

export type JumpLinksRailLink = {
  id: string;
  label: string;
};

type JumpLinksRailProps = {
  links: JumpLinksRailLink[];
  activeId: string | undefined;
};

/** Sticky left rail of `JumpLink`s. Used by {@link FormSectionLayout} when `withJumpLinks` is on. */
export function JumpLinksRail(props: JumpLinksRailProps) {
  const { links, activeId } = props;
  const tid = useTestIds(props, "jumpLinks");

  return (
    <nav css={Css.df.fdc.fs0.wPx(jumpLinksRailWidthPx).sticky.asfs.top(stickyNavAndHeaderOffset()).$} {...tid}>
      {links.map((link) => (
        <JumpLink key={link.id} label={link.label} href={`#${link.id}`} active={link.id === activeId} {...tid.link} />
      ))}
    </nav>
  );
}

export const jumpLinksRailWidthPx = 192;

/** Row width below which the rail and a full-width `sm` shell no longer both fit. */
const railAndShellPx = centeredShellMaxPx.sm + jumpLinksRailWidthPx;

/**
 * `margin-right` mirroring the rail so the content column stays page-centered, as it is without a rail.
 *
 * `clamp(min, preferred, max)` is `max(min, min(preferred, max))`: use `preferred`, but never leave
 * `min`..`max`. Here `preferred` is `100% - 960px` — the row width (`100%` is the flex row) minus the
 * rail + shell that must fit first, i.e. the space actually left over. So the mirror is `0` up to a
 * 960px row, grows with the row, and caps at the rail's 192px from 1152px up. Giving up the mirror
 * first is what lets a tight row drop the centering instead of narrowing the form.
 */
export const jumpLinksRailReservation = `clamp(0px, 100% - ${railAndShellPx}px, ${jumpLinksRailWidthPx}px)`;
