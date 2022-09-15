import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { Accordion} from "./Accordion";

export default {
  component: Accordion,
  title: "Components/Accordion",
} as Meta;

export function AccordionVariations() {
  return (
    <>
      <Accordion title="Top section disabled" topSection={false}>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Default expanded" defaultExpanded>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion disabled title="Disabled">
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
      <Accordion title="Bottom section enabled" bottomSection>
        <div css={Css.sm.$}>
          Our modern approach to homebuilding makes the process easier and more personal than ever before.
        </div>
      </Accordion>
    </>
  );
}
 