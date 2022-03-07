import { Fragment, ReactElement } from "react";
import {
  GridColumn,
  GridDataRow,
  GridStyle,
  Kinded,
  NestedCardsStyle,
  NestedCardStyle,
  RowTuple,
} from "src/components/Table/GridTable";
import { Css } from "src/Css";

// type Chrome = () => JSX.Element;
// type ChromeBuffer = Chrome[];
// Chrome contains a left, center, and right column JSX.
type ChromeColumns = () => [JSX.Element, JSX.Element, JSX.Element];
type ChromeColumnsBuffer = ChromeColumns[];

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
  private readonly chromeColumnsBuffer: ChromeColumnsBuffer = [];
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
      this.chromeColumnsBuffer.push(makeOpenOrCloseCardColumns(this.openCards, this.styles, "open"));
    }
    // But always close previous cards if needed
    this.maybeCreateChromeRow();
    return !!card;
  }

  closeCard() {
    this.chromeColumnsBuffer.push(makeOpenOrCloseCardColumns(this.openCards, this.styles, "close"));
    this.openCards.pop();
  }

  addSpacer() {
    this.chromeColumnsBuffer.push(makeSpacerColumns(this.styles.spacerPx, this.openCards, this.styles));
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
    if (this.chromeColumnsBuffer.length > 0) {
      this.rows.push([
        { chromeRow: true },
        <ChromeRowImpl
          key={this.chromeRowIndex++}
          chromeColumnsBuffer={[...this.chromeColumnsBuffer]}
          columns={this.columns}
          firstLastColumnWidth={this.styles.firstLastColumnWidth}
        />,
      ]);
      this.chromeColumnsBuffer.splice(0, this.chromeColumnsBuffer.length);
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
export function makeOpenOrCloseCardColumns(
  openCards: string[],
  style: NestedCardsStyle,
  kind: "open" | "close",
): ChromeColumns {
  const scopeCards = [...openCards];
  return () => {
    const cardStyles = style.kinds;
    let leftCol: JSX.Element = <Fragment />;
    let centerCol: JSX.Element = <Fragment />;
    let rightCol: JSX.Element = <Fragment />;
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
        leftCol = (
          <div
            data-openorclose={true}
            css={{
              ...Css.w100.bgColor(card.bgColor).plPx(card.pxPx).hPx(card.brPx).$,
              // Only the 1st div needs border left radius + border top/bottom.
              ...(first &&
                Css.add({
                  [`border${place}LeftRadius`]: `${card.brPx}px`,
                }).$),
              ...(card.bColor && Css.bc(card.bColor).bl.if(first)[btOrBb].$),
            }}
          >
            {leftCol}
          </div>
        );

        centerCol = (
          <div
            css={{
              ...Css.w100.bgColor(card.bgColor).hPx(card.brPx).$,
              ...(card.bColor && Css.bc(card.bColor).if(first)[btOrBb].$),
            }}
            data-openclose={kind}
          >
            {centerCol}
          </div>
        );

        rightCol = (
          <div
            css={{
              ...Css.w100.bgColor(card.bgColor).prPx(card.pxPx).hPx(card.brPx).$,
              // Only the 1st div needs border right radius + border top/bottom.
              ...(first &&
                Css.add({
                  [`border${place}RightRadius`]: `${card.brPx}px`,
                }).$),
              ...(card.bColor && Css.bc(card.bColor).br.if(first)[btOrBb].$),
            }}
          >
            {rightCol}
          </div>
        );
      });
    return [leftCol, centerCol, rightCol];
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

export function maybeAddCardPadding(
  openCards: NestedCardStyle[],
  column: "first" | "final",
  style: NestedCardsStyle,
  row: GridDataRow<any>,
): any {
  const isHeader = row.kind === "header";
  const leafRow = isLeafRow(row);
  let div: any = undefined;
  [...openCards].reverse().forEach((card, idx) => {
    // Only add the borders on the inner most card if it is a leaf row and has style definitions.
    const applyBorder = idx === 0 && leafRow && Boolean(style.kinds[row.kind]);

    div = (
      <div
        css={{
          ...Css.h100.bgColor(card.bgColor).if(!!card.bColor).bc(card.bColor).$,
          ...(applyBorder ? Css.if(!!card.bColor).bc(card.bColor).bb.bt.$ : {}),
          ...(column === "first" &&
            Css.plPx(card.pxPx).if(!!card.bColor).bl.if(applyBorder).borderRadius(`${card.brPx}px 0 0 ${card.brPx}px`)
              .$),
          ...(column === "final" &&
            Css.prPx(card.pxPx).if(!!card.bColor).br.if(applyBorder).borderRadius(`0 ${card.brPx}px ${card.brPx}px 0`)
              .$),
        }}
      >
        {div}
      </div>
    );
  });

  return (
    <div
      data-cardpadding="true"
      css={{
        ...Css.sticky.z1.h("inherit").p0.wPx(style.firstLastColumnWidth).$,
        ...(column === "first" && Css.left0.$),
        ...(column === "final" && Css.right0.$),
      }}
    >
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
export function makeSpacerColumns(height: number, openCards: string[], styles: NestedCardsStyle): ChromeColumns {
  const scopeCards = [...openCards];

  return () => {
    let leftCol: JSX.Element = <div data-spacer={true} css={Css.hPx(height).$} />;
    let centerCol: JSX.Element = <div data-spacer={true} css={Css.hPx(height).$} />;
    let rightCol: JSX.Element = <div data-spacer={true} css={Css.hPx(height).$} />;
    // Start at the current/inside card, and wrap outward padding + borders.
    // | card1 | card2 | ... card3 ... | card2 | card1 |

    [...scopeCards]
      .map((cardKind) => styles.kinds[cardKind])
      .reverse()
      .forEach((card) => {
        leftCol = (
          <div
            data-spacer={true}
            css={Css.w100.hPx(height).bgColor(card.bgColor).plPx(card.pxPx).if(!!card.bColor).bc(card.bColor).bl.$}
          >
            {leftCol}
          </div>
        );
        rightCol = (
          <div
            data-spacer={true}
            css={Css.w100.hPx(height).bgColor(card.bgColor).prPx(card.pxPx).if(!!card.bColor).bc(card.bColor).br.$}
          >
            {rightCol}
          </div>
        );
        centerCol = (
          <div data-spacer={true} css={Css.w100.hPx(height).bgColor(card.bgColor).$}>
            {centerCol}
          </div>
        );
      });

    return [leftCol, centerCol, rightCol];
  };
}

interface ChromeRowImplProps {
  chromeColumnsBuffer: ChromeColumnsBuffer;
  columns: GridColumn<any>[];
  firstLastColumnWidth?: number;
}
export function ChromeRowImpl({ chromeColumnsBuffer, columns, firstLastColumnWidth = 0 }: ChromeRowImplProps) {
  const [leftCol, centerCol, rightCol] = chromeColumnsBuffer.reduce(
    (acc, ccb) => {
      const [lc, cc, rc] = ccb();
      return [acc[0].concat(lc), acc[1].concat(cc), acc[2].concat(rc)];
    },
    [[], [], []] as [JSX.Element[], JSX.Element[], JSX.Element[]],
  );

  return (
    <div css={Css.df.$}>
      <div css={Css.h("inherit").sticky.z1.left0.wPx(firstLastColumnWidth).p0.$}>
        {leftCol.map((lc, idx) => (
          <Fragment key={`lc_${idx}`}>{lc}</Fragment>
        ))}
      </div>
      <div css={Css.h("inherit").p0.fg1.$}>
        {centerCol.map((cc, idx) => (
          <Fragment key={`cc_${idx}`}>{cc}</Fragment>
        ))}
      </div>
      <div css={Css.h("inherit").sticky.z1.right0.wPx(firstLastColumnWidth).p0.$}>
        {rightCol.map((rc, idx) => (
          <Fragment key={`rc_${idx}`}>{rc}</Fragment>
        ))}
      </div>
    </div>
  );
}

export function dropChromeRows<R extends Kinded>(rows: RowTuple<R>[]): [GridDataRow<R>, ReactElement][] {
  return rows.filter(([r]) => !isChromeRow(r)) as [GridDataRow<R>, ReactElement][];
}

export type ChromeRow = { chromeRow: true };
export function isChromeRow<R extends Kinded>(row: GridDataRow<R> | ChromeRow): row is ChromeRow {
  return typeof row === "object" && "chromeRow" in row && row.chromeRow;
}
export function isLeafRow<R extends Kinded>(row: GridDataRow<R>): boolean {
  return row.children === undefined || row.children.length === 0;
}
