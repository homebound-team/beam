import { Fragment, ReactElement } from "react";
import {
  GridColumn,
  GridDataRow,
  GridStyle,
  Kinded,
  NestedCard,
  NestedCardsStyle,
  RowTuple,
} from "src/components/Table/GridTable";
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
  private readonly openCards: Array<NestedCard<any>> = [];
  // A buffer of the open/close/spacer rows we need between each content row.
  private readonly chromeBuffer: JSX.Element[] = [];
  private readonly styles: NestedCardsStyle;

  constructor(private columns: GridColumn<any>[], private filteredRows: RowTuple<any>[], private style: GridStyle) {
    this.styles = style.nestedCards!;
  }

  maybeOpenCard(row: GridDataRow<any>): boolean {
    const openCard: NestedCard<any> = {
      style: this.styles.kinds[row.kind],
      row,
    };
    // If this kind doesn't have a card defined, don't put it on the card stack
    if (openCard.style) {
      this.openCards.push(openCard);
      this.chromeBuffer.push(makeOpenOrCloseCard(this.openCards, "open"));
    }
    // But always close previous cards if needed
    maybeCreateChromeRow(this.columns, this.filteredRows, this.chromeBuffer);
    return !!openCard.style;
  }

  closeCard() {
    this.chromeBuffer.push(makeOpenOrCloseCard(this.openCards, "close"));
    this.openCards.pop();
  }

  addSpacer(below: GridDataRow<any> | undefined, above: GridDataRow<any> | undefined) {
    this.chromeBuffer.push(makeSpacer(this.styles.spacerPx, this.openCards, below, above));
  }

  done() {
    maybeCreateChromeRow(this.columns, this.filteredRows, this.chromeBuffer);
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
export function makeOpenOrCloseCard(openCards: Array<NestedCard<any>>, kind: "open" | "close"): JSX.Element {
  let div: any = <div />;
  const place = kind === "open" ? "Top" : "Bottom";
  const btOrBb = kind === "open" ? "bt" : "bb";
  // Create nesting for the all open cards, i.e.:
  //
  // | card1 | card2  --------------   card2 | card1 |
  // | card1 | card2 / ... card3 ... \ card2 | card1 |
  // | card1 | card2 | ... card3 ... | card2 | card1 |
  //
  [...openCards].reverse().forEach(({ style }, i) => {
    const first = i === 0;
    div = (
      <div
        css={{
          ...Css.bgColor(style.bgColor).pxPx(style.pxPx).$,
          // Only the 1st div needs border left/right radius + border top/bottom.
          ...(first &&
            Css.add({
              [`border${place}RightRadius`]: `${style.brPx}px`,
              [`border${place}LeftRadius`]: `${style.brPx}px`,
            }).hPx(style.brPx).$),
          ...(style.bColor && Css.bc(style.bColor).bl.br.if(first)[btOrBb].$),
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
export function maybeAddCardPadding(openCards: Array<NestedCard<any>>, column: "first" | "final", styles?: {}): any {
  let div: any = undefined;
  [...openCards].reverse().forEach(({ style }) => {
    div = (
      <div
        css={{
          ...Css.h100.bgColor(style.bgColor).if(!!style.bColor).bc(style.bColor).$,
          ...(column === "first" && Css.plPx(style.pxPx).if(!!style.bColor).bl.$),
          ...(column === "final" && Css.prPx(style.pxPx).if(!!style.bColor).br.$),
        }}
      >
        {div}
      </div>
    );
  });

  return (
    <div data-cardpadding="true" {...(styles ? { css: styles } : {})}>
      {div}
    </div>
  );
}

/**
 * Create a spacer between rows of children.
 *
 * Our height is not based on `openCards`, b/c for the top-most level, we won't
 * have any open cards, but still want a space between top-level cards.
 */
export function makeSpacer(
  height: number,
  openCards: Array<NestedCard<any>>,
  below: GridDataRow<any> | undefined,
  above: GridDataRow<any> | undefined,
) {
  const noOpenCards = openCards.length == 0;
  const parentId = noOpenCards ? "root" : openCards[openCards.length - 1].row.id;

  let div = (
    <div
      css={Css.hPx(height).$}
      data-parent-id={parentId}
      {...{
        onClick: (e) => {
          console.log(`
            ParentId: ${e.currentTarget.dataset.parentId}\n
            Dropped AboveRowId: ${above?.id}
            Dropped BelowRowId: ${below?.id}
          `);
        },
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
          // The row data being dropped
          // TODO: TS types?
          const row = JSON.parse(e.dataTransfer.getData("row"));

          console.log(`
            DroppedId: ${row.id}\n
            ParentId: ${e.currentTarget.dataset.parentId}\n
            AboveRowId: ${below?.id}
            BelowRowId: ${above?.id}
          `);
          console.log(row);
        },
      }}
      {...(noOpenCards && {
        onClick: (e) => {
          console.log(`
            ParentId: ${e.currentTarget.dataset.parentId}\n
            Dropped AboveRowId: ${above?.id}
            Dropped BelowRowId: ${below?.id}
          `);
        },
        onDragEnter: (e) => {
          e.currentTarget.style.backgroundColor = "red";
        },
        onDragLeave: (e) => {
          // Restore previous styles
          // Before changing the background, save the current styles
          // @ts-ignore
          // TODO: Restore the orig styles
        },
      })}
    />
  );

  // Start at the current/inside card, and wrap outward padding + borders.
  // | card1 | card2 | ... card3 ... | card2 | card1 |
  [...openCards].reverse().forEach(({ row, style }, i, arr) => {
    // Flag for top level div
    const isShallowestDiv = i === 0;

    div = (
      <div
        {...(isShallowestDiv && {
          onDragEnter: (e) => {
            e.currentTarget.style.backgroundColor = "red";
          },
          onDragLeave: (e) => {
            // Restore previous styles
            // Before changing the background, save the current styles
            // @ts-ignore
            // TODO: Restore the orig styles
          },
        })}
        data-parentid={isShallowestDiv ? arr[0].row.id : undefined}
        css={Css.bgColor(style.bgColor).pxPx(style.pxPx).if(!!style.bColor).bc(style.bColor).bl.br.$}
      >
        {div}
      </div>
    );
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
      // TODO: Here is where we will place the onDrop and onDragOver, onDragExit.
      // TODO: Maybe in here we can pass some metadate that we can pass on to the caller
      <div css={Css.gc(`span ${columns.length + 2}`).gtc("auto").important.$} data-chrome="true">
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
