import type { ReactNode } from "react";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Tokens } from "src/Css";
import { getButtonOrLink } from "src/utils/getInteractiveElement";

export type CellTextAction = {
  /** A string renders a link, a function renders a button styled as a link. */
  onClick: string | VoidFunction;
  openInNew?: boolean;
  download?: boolean;
};

type CellTextProps = {
  text: string;
  /** Wraps only the text, never the start/end slots. */
  action?: CellTextAction;
  /** Sits before the text, centered on its first line. */
  start?: ReactNode;
  /** Sits after the text, centered on its first line. */
  end?: ReactNode;
};

/**
 * Shared layout for text-like cell builders (internal).
 *
 * Flexible rows wrap the text (breaking long words), fixed rows clamp it to one line. The slots never
 * shrink, and are one line tall so they line up with the first line of text and with neighboring cells.
 * The empty state isn't handled here: builders return empty content so the table's `emptyCell` shows.
 */
export function CellText(props: CellTextProps) {
  const { text, action, start, end } = props;
  const { wrap } = usePresentationContext();
  const fixed = wrap === false;

  const textEl = (
    <span css={Css.if(fixed).lineClamp1.wbba.$} title={fixed ? text : undefined}>
      {text}
    </span>
  );

  return (
    <span css={Css.df.gap1.mw0.maxw100.$}>
      {start && <Slot>{start}</Slot>}
      {action ? (
        getButtonOrLink(
          textEl,
          action.onClick,
          Css.props(Css.mw0.color(Tokens.TextLinkDefault).ta("inherit").$),
          action.openInNew,
          action.download,
        )
      ) : (
        <span css={Css.mw0.$}>{textEl}</span>
      )}
      {end && <Slot>{end}</Slot>}
    </span>
  );
}

/** One line tall (`1lh`) at whatever typography the cell uses, so its content centers on the first line of text. */
function Slot({ children }: { children: ReactNode }) {
  return <span css={Css.df.aic.fs0.h("1lh").$}>{children}</span>;
}
