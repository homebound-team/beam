import { NestedCardStyle } from "src/components/Table/GridTable";
import { makeOpenOrCloseCard, maybeAddCardPadding } from "src/components/Table/nestedCards";
import { Palette } from "src/Css";
import { render } from "src/utils/rtl";

const parentCardStyle: NestedCardStyle = {
  bgColor: Palette.Gray100,
  brPx: 8,
  pxPx: 8,
  spacerPx: 8,
};

const childCardStyle: NestedCardStyle = {
  bgColor: Palette.Gray300,
  bColor: Palette.Gray200,
  brPx: 6,
  pxPx: 6,
  spacerPx: 6,
};

describe("NestedCards", () => {
  it("can make open card w/one level", async () => {
    const r = await render(makeOpenOrCloseCard([parentCardStyle], "open"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        padding-left: 8px;
        padding-right: 8px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        height: 8px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        >
          <div />
        </div>
      </div>
    `);
  });

  it("can make open card w/two levels", async () => {
    const r = await render(makeOpenOrCloseCard([parentCardStyle, childCardStyle], "open"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        padding-left: 8px;
        padding-right: 8px;
      }

      .emotion-1 {
        background-color: rgba(221,220,220,1);
        padding-left: 6px;
        padding-right: 6px;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        height: 6px;
        border-color: rgba(236,235,235,1);
        border-left-style: solid;
        border-left-width: 1px;
        border-right-style: solid;
        border-right-width: 1px;
        border-top-style: solid;
        border-top-width: 1px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        >
          <div
            class="emotion-1"
          >
            <div />
          </div>
        </div>
      </div>
    `);
  });

  it("can add left padding w/two levels", async () => {
    const r = await render(maybeAddCardPadding([parentCardStyle, childCardStyle], "first"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        height: 100%;
        padding-left: 8px;
      }

      .emotion-1 {
        background-color: rgba(221,220,220,1);
        border-color: rgba(236,235,235,1);
        height: 100%;
        border-left-style: solid;
        border-left-width: 1px;
        padding-left: 6px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        >
          <div
            class="emotion-1"
          >
            <div />
          </div>
        </div>
      </div>
    `);
  });

  it("can add right padding w/two levels", async () => {
    const r = await render(maybeAddCardPadding([parentCardStyle, childCardStyle], "final"));
    expect(r.firstElement).toMatchInlineSnapshot(`
      .emotion-0 {
        background-color: rgba(247,245,245,1);
        height: 100%;
        padding-right: 8px;
      }

      .emotion-1 {
        background-color: rgba(221,220,220,1);
        border-color: rgba(236,235,235,1);
        height: 100%;
        border-right-style: solid;
        border-right-width: 1px;
        padding-right: 6px;
      }

      <div
        data-overlay-container="true"
      >
        <div
          class="emotion-0"
        >
          <div
            class="emotion-1"
          >
            <div />
          </div>
        </div>
      </div>
    `);
  });
});
