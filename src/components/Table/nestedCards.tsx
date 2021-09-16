import React, { Fragment, ReactElement } from "react";
import { GridColumn, GridDataRow, GridStyle, Kinded, NestedCardStyle, RowTuple } from "src/components/Table/GridTable";
import { Css } from "src/Css";

/**
 * A helper class to create our nested card DOM shenanigans.
 *
 * This acts as a one-off visitor that accepts "begin row", "between row",
 * "end row" calls from GridTable while its translating the user's nested
 * GridDataRows into a flat list of RowTuples, and interjects fake/chrome
 * rows into `filteredRows` as necessary.
 *
 * Note that this class only handles *between row* chrome and that within
 * a content row itself, the nested padding is handled separately by the
 * GridRow component.
 */
export class NestedCards {
  // A stack of the current cards we're showing
  private readonly openCards: Array<NestedCardStyle> = [];
  // A buffer of the open/close/spacer rows we need between each content row.
  private readonly chromeBuffer: JSX.Element[] = [];
  private readonly styles: Record<string, NestedCardStyle>;

  constructor(private columns: GridColumn<any>[], private filteredRows: RowTuple<any>[], private style: GridStyle) {
    this.styles = style.nestedCards!.kinds;
  }

  maybeOpenCard(row: GridDataRow<any>): boolean {
    const card = this.styles[row.kind];
    // If this kind doesn't have a card defined, don't put it on the card stack
    if (card) {
      this.openCards.push(card);
      this.chromeBuffer.push(makeOpenOrCloseCard(this.openCards, "open"));
    }
    // But always close previous cards if needed
    maybeCreateChromeRow(this.columns, this.filteredRows, this.chromeBuffer);
    return !!card;
  }

  closeCard() {
    this.chromeBuffer.push(makeOpenOrCloseCard(this.openCards, "close"));
    this.openCards.pop();
  }

  addSpacerBetweenChildren() {
    const openCard = this.openCards[this.openCards.length - 1];
    // If we're between two top-level cards, there is no open card, so fallback on topLevelSpacerPx
    const height = openCard?.spacerPx || this.style.nestedCards!.topLevelSpacerPx;
    this.chromeBuffer.push(makeSpacer(height, this.openCards));
  }

  done() {
    maybeCreateChromeRow(this.columns, this.filteredRows, this.chromeBuffer);
  }

  maxCardPadding(current: number | undefined): number {
    const padding = this.openCards.map((c) => c.pxPx).reduce((a, b) => a + b, 0);
    return Math.max(padding, current || 0);
  }

  /** Return a stable copy of the cards, so it won't change as we keep going. */
  currentOpenCards() {
    return [...this.openCards];
  }
}

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
  let div: any = <div />;
  const place = kind === "open" ? "Top" : "Bottom";
  const btOrBb = kind === "open" ? "bt" : "bb";
  // Create nesting for the all open cards, i.e.:
  //
  // | card1 | card2  --------------   card2 | card1 |
  // | card1 | card2 / ... card3 ... \ card2 | card1 |
  // | card1 | card2 | ... card3 ... | card2 | card1 |
  //
  [...openCards].reverse().forEach((card, i) => {
    const first = i === 0;
    div = (
      <div
        css={{
          ...Css.bgColor(card.bgColor).pxPx(card.pxPx).$,
          // Only the 1st div needs border left/right radius + border top/bottom.
          ...(first &&
            Css.add({
              [`border${place}RightRadius`]: `${card.brPx}px`,
              [`border${place}LeftRadius`]: `${card.brPx}px`,
            }).hPx(card.brPx).$),
          ...(card.bColor && Css.bc(card.bColor).bl.br.if(first)[btOrBb].$),
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
export function maybeAddCardPadding(openCards: NestedCardStyle[], column: "first" | "final"): any {
  let div: any = <div />;
  [...openCards].reverse().forEach((card) => {
    div = (
      <div
        css={{
          ...Css.h100.bgColor(card.bgColor).if(!!card.bColor).bc(card.bColor).$,
          ...(column === "first" && Css.plPx(card.pxPx).if(!!card.bColor).bl.$),
          ...(column === "final" && Css.prPx(card.pxPx).if(!!card.bColor).br.$),
        }}
      >
        {div}
      </div>
    );
  });
  return div;
}

/**
 * Create a spacer between rows of children.
 *
 * Our height is not based on `openCards`, b/c for the top-most level, we won't
 * have any open cards, but still want a space between top-level cards.
 */
export function makeSpacer(height: number, openCards: NestedCardStyle[]) {
  let div = <div css={Css.hPx(height).$} />;
  // Start at the current/inside card, and wrap outward padding + borders.
  // | card1 | card2 | ... card3 ... | card2 | card1 |
  [...openCards].reverse().forEach((card) => {
    div = <div css={Css.bgColor(card.bgColor).pxPx(card.pxPx).if(!!card.bColor).bc(card.bColor).bl.br.$}>{div}</div>;
  });
  return div;
}

/**
 * Takes the current buffer of close row(s), spacers, and open row, and creates a single chrome DOM row.
 *
 * This allows a minimal amount of DOM overhead, insofar as to the css-grid or react-virtuoso we only
 * 1 extra DOM node between each row of content to achieve our nested card look & feel, i.e.:
 *
 * - chrome row (open)
 * - card1 content row
 * - chrome row (card2 open)
 * - nested card2 content row
 * - chrome row (card2 close, card1 close)
 */
export function maybeCreateChromeRow(
  columns: GridColumn<any>[],
  filteredRows: RowTuple<any>[],
  chromeBuffer: JSX.Element[],
): void {
  if (chromeBuffer.length > 0) {
    filteredRows.push([
      undefined,
      // We add 2 to account for our dedicated open/close columns
      <div css={Css.gc(`span ${columns.length + 2}`).$}>
        {chromeBuffer.map((c, i) => (
          <Fragment key={i}>{c}</Fragment>
        ))}
      </div>,
    ]);
    // clear the buffer
    chromeBuffer.splice(0, chromeBuffer.length);
  }
}

export function dropChromeRows<R extends Kinded>(filteredRows: RowTuple<R>[]): [GridDataRow<R>, ReactElement][] {
  return filteredRows.filter(([r]) => !!r) as [GridDataRow<R>, ReactElement][];
}
