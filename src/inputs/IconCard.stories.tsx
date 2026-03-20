import { Meta } from "@storybook/react-vite";
import { Css, IconCard, IconCardProps, Palette } from "src";

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

/** Hover styled version of the IconCard — uses a scoped stylesheet to force hover styles for visual testing. */
function HoveredIconCard(args: IconCardProps) {
  return (
    <div className="hovered-icon-card">
      <style>{`.hovered-icon-card button { background-color: ${Palette.Gray100}; }`}</style>
      <IconCard {...args} />
    </div>
  );
}
