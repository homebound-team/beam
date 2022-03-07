import { Fragment, ReactElement } from "react";
import {
  GridColumn,
  GridDataRow,
  GridStyle,
  Kinded,
  NestedCardsStyle,
  NestedCardStyle,
  NestedCardStyleByKind,
  RowTuple,
} from "src/components/Table/GridTable";
import { Css } from "src/Css";

type Chrome = () => JSX.Element;
type ChromeBuffer = Chrome[];

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
  private readonly openCards: Array<string> = [];
  // A buffer of the open/close/spacer rows we need between each content row.
  private readonly chromeBuffer: ChromeBuffer = [];
  private chromeRowIndex: number = 0;

  constructor(
    private readonly columns: GridColumn<any>[],
    // An array of rows which we will add open Chrome rows too to create the table.
    private readonly rows: RowTuple<any>[],
    private readonly styles: NestedCardsStyle,
  ) {}

  /**
   * Maybe add an opening Chrome row to the given `row` if its a nested card.
   *
   * @param row The row which will be opened. The open Chrome row will appear
   * above this row.
   */
  maybeOpenCard(row: GridDataRow<any>): boolean {
    const card = this.styles.kinds[row.kind];
    // If this kind doesn't have a card defined or is a leaf card (which handle their own card styles in GridRow), then don't put it on the card stack
    if (card && !isLeafRow(row)) {
      this.openCards.push(row.kind);
      this.chromeBuffer.push(makeOpenOrCloseCard(this.openCards, this.styles.kinds, "open"));
    }
    // But always close previous cards if needed
    this.maybeCreateChromeRow();
    return !!card;
  }

  closeCard() {
    this.chromeBuffer.push(makeOpenOrCloseCard(this.openCards, this.styles.kinds, "close"));
    this.openCards.pop();
  }

  addSpacer() {
    this.chromeBuffer.push(makeSpacer(this.styles.spacerPx, this.openCards, this.styles));
  }

  /**
   * Close the remaining open rows with a close Chrome row.
   *
   * @param row The row that is completing/closing nested open Chrome rows.
   */
  done() {
    this.maybeCreateChromeRow();
  }

  /** Return a stable copy of the cards, so it won't change as we keep going. */
  currentOpenCards() {
    return this.openCards.join(":");
  }

  /**
   * Takes the current Chrome row buffer of close row(s), spacers, and open row,
   * and creates a single chrome DOM row.
   *
   * This allows a minimal amount of DOM overhead, insofar as to the css-grid or
   * react-virtuoso we only add 1 extra DOM node between each row of content to
   * achieve our nested card look & feel.
   *
   * i.e.:
   * - chrome row (open)
   * - card1 content row
   * - chrome row (card2 open)
   * - nested card2 content row
   * - chrome row (card2 close, card1 close)
   */
  maybeCreateChromeRow(): void {
    if (this.chromeBuffer.length > 0) {
      this.rows.push([undefined, <ChromeRow key={this.chromeRowIndex++} chromeBuffer={[...this.chromeBuffer]} />]);
      // clear the Chrome buffer
      this.chromeBuffer.splice(0, this.chromeBuffer.length);
    }
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
export function makeOpenOrCloseCard(
  openCards: string[],
  cardStyles: NestedCardStyleByKind,
  kind: "open" | "close",
): Chrome {
  const scopeCards = [...openCards];
  return () => {
    let div: any = <div />;
    const place = kind === "open" ? "Top" : "Bottom";
    const btOrBb = kind === "open" ? "bt" : "bb";
    // Create nesting for the all open cards, i.e.:
    //
    // | card1 | card2  --------------   card2 | card1 |
    // | card1 | card2 / ... card3 ... \ card2 | card1 |
    // | card1 | card2 | ... card3 ... | card2 | card1 |
    //
    [...scopeCards]
      .map((cardKind) => cardStyles[cardKind])
      .reverse()
      .forEach((card, i) => {
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
  };
}

/**
 * Wraps a row within its parent cards. Creates a wrapping div to add the card padding.
 * Adds non-leaf card padding and borders, e.g. if the current row is a non-leaf then it will already be in `openCards`
 * Example:
 * <div parent> <div child> <div grandchild /> </div> </div>
 */
export function wrapCard(openCards: NestedCardStyle[], row: JSX.Element): JSX.Element {
  let div: JSX.Element = row;
  [...openCards].reverse().forEach((card) => {
    div = (
      <div
        css={{
          ...Css.h100.pxPx(card.pxPx).bgColor(card.bgColor).if(!!card.bColor).bc(card.bColor).bl.br.$,
        }}
      >
        {div}
      </div>
    );
  });

  return div;
}

export function getNestedCardStyles(
  row: GridDataRow<any>,
  openCardStyles: NestedCardStyle[] | undefined,
  style: GridStyle,
) {
  const leafCardStyles = isLeafRow(row) ? style.nestedCards?.kinds[row.kind] : undefined;
  // Calculate the horizontal space already allocated by the open cards (paddings and borders)
  const openCardWidth = openCardStyles ? openCardStyles.reduce((acc, o) => acc + o.pxPx + (o.bColor ? 1 : 0), 0) : 0;
  // Subtract the openCardWidth from the `firstLastColumnWidth` to determine the amount of padding to add to this card.
  // Also if it is a leaf card, then we need to additionally subtract out the border width to have it properly line up with the chrome rows
  const currentCardPaddingWidth =
    (style.nestedCards?.firstLastColumnWidth ?? 0) - openCardWidth - (leafCardStyles?.bColor ? 1 : 0);

  return {
    // Card styles apply a calculated padding to ensure the content lines up properly across all columns
    ...(currentCardPaddingWidth ? Css.pxPx(currentCardPaddingWidth).$ : undefined),
    // Leaf cards define their own borders + padding
    ...(leafCardStyles
      ? // We can have versions of the same card as a leaf and not as a leaf.
        // When it is not a leaf then it has chrome rows that create the top and bottom "padding" based on border-radius size. (brPx = "chrome" row height)
        // When it is a leaf, then we need to apply the brPx to the row to ensure consistent spacing between leaf & non-leaf renders
        // Additionally, if the leaf card has a border, then subtract the 1px border width from the padding to keep consistent with the "chrome" row
        Css.pyPx(leafCardStyles.brPx - (leafCardStyles.bColor ? 1 : 0))
          .borderRadius(`${leafCardStyles.brPx}px`)
          .bgColor(leafCardStyles.bgColor)
          .if(!!leafCardStyles.bColor)
          .bc(leafCardStyles.bColor).ba.$
      : undefined),
  };
}

/**
 * Create a spacer between rows of children.
 *
 * Our height is not based on `openCards`, b/c for the top-most level, we won't
 * have any open cards, but still want a space between top-level cards.
 */
export function makeSpacer(height: number, openCards: string[], styles: NestedCardsStyle): Chrome {
  const scopeCards = [...openCards];
  return () => {
    let div = <div css={Css.hPx(height).$} />;
    // Start at the current/inside card, and wrap outward padding + borders.
    // | card1 | card2 | ... card3 ... | card2 | card1 |
    [...scopeCards]
      .map((cardKind) => styles.kinds[cardKind])
      .reverse()
      .forEach((card) => {
        div = (
          <div css={Css.bgColor(card.bgColor).pxPx(card.pxPx).if(!!card.bColor).bc(card.bColor).bl.br.$}>{div}</div>
        );
      });
    return div;
  };
}

interface ChromeRowProps {
  chromeBuffer: ChromeBuffer;
}
export function ChromeRow({ chromeBuffer }: ChromeRowProps) {
  return (
    // We add 2 to account for our dedicated open/close columns
    <div>
      {chromeBuffer.map((c, i) => (
        <Fragment key={i}>{c()}</Fragment>
      ))}
    </div>
  );
}

export function dropChromeRows<R extends Kinded>(rows: RowTuple<R>[]): [GridDataRow<R>, ReactElement][] {
  return rows.filter(([r]) => !!r) as [GridDataRow<R>, ReactElement][];
}

export function isLeafRow<R extends Kinded>(row: GridDataRow<R>): boolean {
  return row.children === undefined || row.children.length === 0;
}
