import { Meta } from "@storybook/react-vite";
import { AiCard, AiPanel } from "src/components/AiPanel";
import { Css, Tokens } from "src/Css";

export default {
  component: AiPanel,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1199-774&m=dev",
    },
  },
} as Meta;

/** The panel is only the AI background — nest {@link AiCard} for the logo and raised card. */
export const Default = () => (
  <div css={Css.wPx(956).$}>
    <AiPanel>
      <AiCard size="sm">
        <div css={Css.sm.color(Tokens.OnSurface).p2.$}>Children go here.</div>
      </AiCard>
    </AiPanel>
  </div>
);

/** `rounded` for a panel sitting within page content rather than spanning it. */
export const Rounded = () => (
  <div css={Css.wPx(1028).$}>
    <AiPanel rounded>
      <AiCard size="sm">
        <div css={Css.sm.color(Tokens.OnSurface).p2.$}>Children go here.</div>
      </AiCard>
    </AiPanel>
  </div>
);

/**
 * The background always spans its container. `fullWidth={false}` on {@link AiCard} shrinks the card
 * to its content and centers it. For a page column, nest `AiCard` in `CenteredLayout` instead.
 */
export const CardWidth = () => (
  <div css={Css.df.fdc.gap4.wPx(1200).$}>
    {[true, false].map((fullWidth) => (
      <div key={String(fullWidth)}>
        <div css={Css.xsSb.gray700.mb1.$}>fullWidth={String(fullWidth)}</div>
        <AiPanel>
          <AiCard fullWidth={fullWidth} size="sm">
            <div css={Css.sm.color(Tokens.OnSurface).p2.$}>Children go here.</div>
          </AiCard>
        </AiPanel>
      </div>
    ))}
  </div>
);

/** Panel `padding` is the background inset; card `size` is the logo + gap. Callers pad card children. */
export function PaddingAndLogo() {
  return (
    <div css={Css.df.fdc.gap4.wPx(956).$}>
      <div>
        <div css={Css.xsSb.gray700.mb1.$}>padding=lg, logo lg, children p3</div>
        <AiPanel padding="lg">
          <AiCard size="lg">
            <div css={Css.sm.color(Tokens.OnSurface).p3.$}>Children go here.</div>
          </AiCard>
        </AiPanel>
      </div>
      <div>
        <div css={Css.xsSb.gray700.mb1.$}>padding=lg, logo lg, children p2</div>
        <AiPanel padding="lg">
          <AiCard size="lg">
            <div css={Css.sm.color(Tokens.OnSurface).p2.$}>Children go here.</div>
          </AiCard>
        </AiPanel>
      </div>
      <div>
        <div css={Css.xsSb.gray700.mb1.$}>padding=sm, logo sm, children p2</div>
        <AiPanel padding="sm">
          <AiCard size="sm">
            <div css={Css.sm.color(Tokens.OnSurface).p2.$}>Children go here.</div>
          </AiCard>
        </AiPanel>
      </div>
    </div>
  );
}
