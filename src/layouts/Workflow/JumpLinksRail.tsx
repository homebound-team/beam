import { JumpLink } from "src/components/JumpLink";
import { Css } from "src/Css";
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

/** Width of the FocusedForm JumpLinks rail; used by right-pane `auto` math. */
export const jumpLinksRailWidthPx = 180;

/** Sticky left rail of `JumpLink`s. Internal to `FocusedFormLayout`. */
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
