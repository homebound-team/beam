import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Accordion } from "./Accordion";

export default {
  component: Accordion,
  title: "Components/Accordion",
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
      <Accordion title="Small" size="s">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Medium" size="m">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Large" size="l">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
    </>
  );
}
