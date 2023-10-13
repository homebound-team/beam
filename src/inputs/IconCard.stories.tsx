import { Meta } from "@storybook/react";
import { Css, IconCard, IconCardProps } from "src";
import { iconCardStylesHover } from "src/inputs/IconCard";

export default {
  component: IconCard,
} as Meta<IconCardProps>;

export function Default() {
  return (
    <div css={Css.df.gap2.jcfs.$}>
      <div>
        <h2>Selected</h2>
        <IconCard icon="house" label="Structural Design" selected onChange={() => {}} />
      </div>
      <div>
        <h2>Not Selected</h2>
        <IconCard icon="house" label="Structural Design" onChange={() => {}} />
      </div>
      <div>
        <h2>Hover</h2>
        <HoveredIconCard icon="house" label="Structural Design" onChange={() => {}} />
      </div>
      <div>
        <h2>Disabled</h2>
        <IconCard icon="house" label="Structural Design" disabled onChange={() => {}} />
      </div>
    </div>
  );
}

/** Hover styled version of the IconButton */
function HoveredIconCard(args: IconCardProps) {
  return (
    <div css={{ button: iconCardStylesHover }}>
      <IconCard {...args} />
    </div>
  );
}
