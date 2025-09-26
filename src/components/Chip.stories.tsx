import { Meta } from "@storybook/react";
import { Chip, ChipTypes } from "src/components/Chip";
import { Css } from "src/Css";

export default {
  component: Chip,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

export function DefaultChip() {
  return (
    <div>
      <div>
        <Chip text="First Last" />
      </div>
      <div css={Css.wPx(300).$}>
        <Chip text={"First Last ".repeat(10)} />
      </div>
    </div>
  );
}

export function ColoredChips() {
  return (
    <div>
      <div css={Css.df.gap1.wPx(550).$}>
        <Chip text="default" />
        <Chip text="caution" type={ChipTypes.caution} />
        <Chip text="warning" type={ChipTypes.warning} />
        <Chip text="success" type={ChipTypes.success} />
        <Chip text="info" type={ChipTypes.info} />
        <Chip text="light" type={ChipTypes.light} />
        <Chip text="darkMode" type={ChipTypes.darkMode} />
        <Chip text="dark" type={ChipTypes.dark} />
      </div>
    </div>
  );
}

export function ChipWithCustomTitle() {
  return <Chip text="Chip text content, hover me" title="Chip has a custom title, different than the content" />;
}

export function ChipWithCustomColor() {
  return <Chip text="Chip with custom color" xss={Css.bgBlue100.$} />;
}

export function WithIcon() {
  return (
    <div css={Css.wPx(200).$}>
      <Chip icon="map" text="Kitchen" />
      <Chip icon="map" text="A very long chip name that will eventually truncate" />
    </div>
  );
}

export function WithCustomLabel() {
  return (
    <div css={Css.wPx(200).df.gap1.$}>
      <Chip
        text={
          <span css={Css.sm.df.gap1.$}>
            <span css={Css.sm.fw6.$}>K</span>
            Kitchen
          </span>
        }
      />
      <Chip
        text={
          <span css={Css.sm.df.gap1.$}>
            <span css={Css.sm.fw6.$}>B</span>
            Bedroom
          </span>
        }
      />
    </div>
  );
}
