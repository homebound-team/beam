import { Meta } from "@storybook/react-vite";
import { JumpLink, JumpLinkProps } from "src/components/JumpLink";
import { Css } from "src/Css";

export default {
  component: JumpLink,
  args: {
    label: "Jump Link",
    href: "#jump-link",
  },
} as Meta<typeof JumpLink>;

/** Replicates the Figma "Jump-Link States" grid: Active/Inactive columns x Default/Hover/Pressed/Focus/Disabled rows. */
export function BaseStates() {
  const rows: Array<{ name: string; storyState?: JumpLinkProps["__storyState"]; disabled?: boolean }> = [
    { name: "Default" },
    { name: "Hover", storyState: { hovered: true } },
    { name: "Focus", storyState: { focusVisible: true } },
    { name: "Disabled", disabled: true },
  ];

  return (
    <div css={Css.df.gap4.$}>
      <div css={Css.df.fdc.gap2.$}>
        <h2>Inactive</h2>
        {rows.map(({ name, storyState, disabled }) => (
          <JumpLink
            key={name}
            active={false}
            label={name}
            href="#jump-link"
            __storyState={storyState}
            disabled={disabled}
          />
        ))}
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <h2>Active</h2>
        {rows.map(({ name, storyState, disabled }) => (
          <JumpLink key={name} active label={name} href="#jump-link" __storyState={storyState} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}

/** Confirms wrapping to 2 lines with an unbroken bar, and clamping/ellipsis beyond that. */
export function Wrapping() {
  return (
    <div css={Css.df.fdc.gap2.wPx(180).$}>
      <JumpLink active label="A jump link that wraps to two lines" href="#jump-link" />
      <JumpLink active={false} label="Line Items Long Section Name That Should Truncate" href="#jump-link" />
    </div>
  );
}

/** Plain vertical stack usage — no grouping/wrapper component needed. Sections below demonstrate the smooth scroll-to behavior. */
export function ListUsage() {
  return (
    <div css={Css.df.gap2.$}>
      <div css={Css.df.fdc.gap1.wPx(180).$}>
        <JumpLink active label="Jump Link 1" href="#section-1" />
        <JumpLink active={false} label="Jump Link 2" href="#section-2" />
        <JumpLink active={false} label="Jump Link 3" href="#section-3" />
      </div>
      <div>
        {["section-1", "section-2", "section-3"].map((id) => (
          <div key={id} id={id} css={Css.hPx(400).df.aic.jcc.bt.bcGray200.$}>
            <h2>{id}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
