import { Meta } from "@storybook/react";
import { Chip } from "src";
import { Css } from "src/Css";
import { Accordion } from "./Accordion";

export default {
  component: Accordion,
  parameters: { backgrounds: { default: "white" } },
} as Meta;

export function AccordionVariations() {
  return (
    <>
      <Accordion title="Top border disabled" topBorder={false}>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Default expanded" defaultExpanded>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Disabled" disabled>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Bottom border enabled" bottomBorder>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
    </>
  );
}

export function AccordionSizes() {
  return (
    <>
      <Accordion title="Extra small" size="xs">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Small" size="sm">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Medium" size="md">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Large" size="lg">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
    </>
  );
}

export function Compact() {
  return (
    <>
      <Accordion
        title={
          <div css={Css.df.w100.jcsb.aic.$}>
            <span>Accordion Title</span>
            <Chip text="$145.85" type="success" compact />
          </div>
        }
        compact
        size="sm"
      >
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
    </>
  );
}
