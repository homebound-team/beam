import { GridColumn, NestedCardStyle } from "src/components/Table/GridTable";
import { Css } from "src/Css";

// Util methods for our nested card DOM shenanigans.

/**
 * Draws the rounded corners (either open or close) for a new card.
 *
 * We have to do this as synthetic rows to support:
 *
 * - parent card 1 open
 * - parent card 1 content
 * - ...N child cards...
 * - parent card 1 close
 *
 * I.e. due to the flatness of our DOM, we inherently have to add a "close"
 * row separate from the card's actual content.
 */
export function makeOpenOrCloseCard(openCards: NestedCardStyle[], kind: "open" | "close"): JSX.Element {
  let div: any = null;
  const place = kind === "open" ? "Top" : "Bottom";
  const btOrBb = kind === "open" ? "bt" : "bb";
  // Create nesting for the all open cards, i.e.:
  //
  // | card1 | card2  --------------   card2 | card1 |
  // | card1 | card2 / ... card3 ... \ card2 | card1 |
  // | card1 | card2 | ... card3 ... | card2 | card1 |
  //
  [...openCards].reverse().forEach((card) => {
    div = (
      <div
        css={{
          ...Css.bgColor(card.bgColor).pxPx(card.pxPx).$,
          // Only the 1st div needs border radius.
          ...(!div &&
            Css.add({
              [`border${place}RightRadius`]: `${card.brPx}px`,
              [`border${place}LeftRadius`]: `${card.brPx}px`,
            }).hPx(card.brPx).$),
          ...(card.bColor && Css.bc(card.bColor).bl.br.if(div)[btOrBb].$),
        }}
      >
        {div}
      </div>
    );
  });
  return div;
}

/**
 * For the first or last cell of actual content, wrap them in divs that re-create the
 * outer cards' padding + background.
 */
export function addCardPadding(columns: GridColumn<any>[], openCards: NestedCardStyle[], idx: number, div: any): any {
  const addLeft = idx === 0;
  const addRight = idx === columns.length - 1;
  if (!addLeft && !addRight) {
    return div;
  }
  [...openCards].reverse().forEach((card) => {
    div = (
      <div
        css={{
          ...Css.bgColor(card.bgColor).if(!!card.bColor).bc(card.bColor).$,
          ...(addLeft && Css.plPx(card.pxPx).if(!!card.bColor).bl.$),
          ...(addRight && Css.prPx(card.pxPx).if(!!card.bColor).br.$),
        }}
      >
        {div}
      </div>
    );
  });
  return div;
}

/** Create a spacer between rows of children. */
export function makeSpacer(current: NestedCardStyle, openCards: NestedCardStyle[]) {
  let div = <div css={Css.hPx(current.spacerPx).$} />;
  // Start at the current/inside card, and wrap outward padding + borders.
  // | card1 | card2 | ... card3 ... | card2 | card1 |
  [...openCards].reverse().forEach((card) => {
    div = <div css={Css.bgColor(card.bgColor).pxPx(card.pxPx).if(!!card.bColor).bc(card.bColor).bl.br.$}>{div}</div>;
  });
  return div;
}
