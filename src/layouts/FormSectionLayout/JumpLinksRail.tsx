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
 * `margin-right` mirroring the rail so the sibling content column stays page-centered (`100%` resolves
 * against the flex row). The clamp drops the mirror instead of narrowing content on shorter rows.
 */
export const jumpLinksRailReservation = `clamp(0px, 100% - ${railAndShellPx}px, ${jumpLinksRailWidthPx}px)`;
