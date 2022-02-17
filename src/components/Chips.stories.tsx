import { Meta } from "@storybook/react";
import { Chips } from "src/components/Chips";
import { PresentationProvider } from "src/components/PresentationContext";
import { Css } from "src/Css";

export default {
  component: Chips,
  title: "Components/Chips",
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
