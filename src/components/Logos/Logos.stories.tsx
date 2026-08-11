import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { BeamLogo, BlueprintAiLogo, HomeboundLogo } from "src/components/Logos";
import { Css, Palette } from "src/Css";

export default {
  component: BlueprintAiLogo,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1198-190&m=dev",
    },
  },
} as Meta;

/**
 * Story-local sizes, not a component prop — these are just the `height` values we pass, in
 * `Css` increments, i.e. `medium` == 40px, the Blueprint AI lockup's natural size. We size by
 * height so the logos stay optically consistent despite their very different aspect ratios.
 */
const sizes = { small: 3, medium: 5, large: 8 };

const logos: { name: string; render: (height: number) => ReactNode }[] = [
  { name: "BlueprintAiLogo", render: (height) => <BlueprintAiLogo height={height} /> },
  { name: "HomeboundLogo", render: (height) => <HomeboundLogo height={height} /> },
  { name: "BeamLogo", render: (height) => <BeamLogo height={height} /> },
];

export function Logos() {
  return (
    <div css={Css.df.fdc.gap4.gray900.$}>
      {logos.map(({ name, render }) => (
        <div key={name} css={Css.df.fdc.gap2.$}>
          <h1 css={Css.xl2.$}>{name}</h1>
          <div css={Css.df.aife.gap4.$}>
            {Object.entries(sizes).map(([size, height]) => (
              <div key={size} css={Css.df.fdc.aic.gap1.$}>
                {render(height)}
                <span css={Css.xs.gray700.$}>{`${size} — height={${height}} (${height * 8}px)`}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** `BeamLogo` and `HomeboundLogo` are single-color, so they take a `fill`. `BlueprintAiLogo` is always the brand gradient. */
export function Fill() {
  const fills = ["currentColor", Palette.Blue600, Palette.Purple800] as const;
  return (
    <div css={Css.df.fdc.gap4.gray900.$}>
      <h1 css={Css.xl2.$}>HomeboundLogo</h1>
      <div css={Css.df.aife.gap4.$}>
        {fills.map((fill) => (
          <HomeboundLogo key={fill} fill={fill} height={sizes.medium} />
        ))}
      </div>
      <h1 css={Css.xl2.$}>BeamLogo</h1>
      <div css={Css.df.aife.gap4.$}>
        {fills.map((fill) => (
          <BeamLogo key={fill} fill={fill} height={sizes.medium} />
        ))}
      </div>
    </div>
  );
}
