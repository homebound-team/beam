import { Meta } from "@storybook/react";
import { Chips, ChipValue } from "src/components/Chips";
import { PresentationProvider } from "src/components/PresentationContext";
import { Css } from "src/Css";

export default {
  component: Chips,
  title: "Workspace/Components/Chips",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101241",
    },
  },
} as Meta;

export function DefaultChips() {
  return (
    <>
      <h1>Chips wrap</h1>
      <div css={Css.wPx(300).ba.$}>
        <Chips values={["First Last", "Second Last", "Third Last", "Fourth Last"]} />
      </div>

      <h1 css={Css.mt3.$}>Chips truncate</h1>
      <div css={Css.wPx(300).ba.$}>
        <PresentationProvider wrap={false}>
          <Chips values={["First Last", "Second Last", "Third Last", "Fourth Last"]} />
        </PresentationProvider>
      </div>

      <h1 css={Css.mt3.$}>Chips do not stretch to fill container</h1>
      <div css={Css.df.wPx(500).hPx(100).ba.$}>
        <Chips values={["First Last", "Second Last", "Third Last", "Fourth Last"]} />
      </div>
    </>
  );
}

export function ChipsWithCustomTitles() {
  const customChips: ChipValue[] = [
    { text: "Chip 1 Content", title: "Custom title 1" },
    { text: "Chip 2 Content", title: "Custom title 2" },
  ];
  return <Chips values={customChips} />;
}
