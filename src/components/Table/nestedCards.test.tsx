import { NestedCardsStyle, NestedCardStyle } from "src/components/Table/types";
import { Palette } from "src/Css";

const parentCardStyle: NestedCardStyle = {
  bgColor: Palette.Gray100,
  brPx: 8,
  pxPx: 8,
};

const childCardStyle: NestedCardStyle = {
  bgColor: Palette.Gray300,
  bColor: Palette.Gray200,
  brPx: 6,
  pxPx: 6,
};

const cardStyles: NestedCardsStyle = {
  firstLastColumnWidth: 24,
  spacerPx: 8,
  kinds: { parent: parentCardStyle, child: childCardStyle },
};

describe("NestedCards", () => {
  // it("can make open card w/one level", async () => {
  //   const r = await render(makeOpenOrCloseCardColumns(["parent"], cardStyles, "open")());
  //   expect(r.firstElement).toMatchInlineSnapshot(`
  //     .emotion-0 {
  //       background-color: rgba(247,245,245,1);
  //       padding-left: 8px;
  //       padding-right: 8px;
  //       border-top-left-radius: 8px;
  //       border-top-right-radius: 8px;
  //       height: 8px;
  //     }
  //
  //     <div
  //       data-overlay-container="true"
  //     >
  //       <div
  //         class="emotion-0"
  //       >
  //         <div />
  //       </div>
  //     </div>
  //   `);
  // });
  //
  // it("can make open card w/two levels", async () => {
  //   const r = await render(makeOpenOrCloseCardColumns(["parent", "child"], cardStyles, "open")());
  //   expect(r.firstElement).toMatchInlineSnapshot(`
  //     .emotion-0 {
  //       background-color: rgba(247,245,245,1);
  //       padding-left: 8px;
  //       padding-right: 8px;
  //     }
  //
  //     .emotion-1 {
  //       background-color: rgba(221,220,220,1);
  //       padding-left: 6px;
  //       padding-right: 6px;
  //       border-top-left-radius: 6px;
  //       border-top-right-radius: 6px;
  //       height: 6px;
  //       border-color: rgba(236,235,235,1);
  //       border-left-style: solid;
  //       border-left-width: 1px;
  //       border-right-style: solid;
  //       border-right-width: 1px;
  //       border-top-style: solid;
  //       border-top-width: 1px;
  //     }
  //
  //     <div
  //       data-overlay-container="true"
  //     >
  //       <div
  //         class="emotion-0"
  //       >
  //         <div
  //           class="emotion-1"
  //         >
  //           <div />
  //         </div>
  //       </div>
  //     </div>
  //   `);
  // });
});
