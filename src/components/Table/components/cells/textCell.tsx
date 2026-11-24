import { Icon, type IconKey } from "src/components/Icon";
import { cardStatusSlot } from "src/components/Table/cardSlots";
import type { GridCellContent } from "src/components/Table/components/cell";
import { CellText } from "src/components/Table/components/cells/CellText";
import { Css, Palette, Tokens } from "src/Css";

/** Colors for the status dot. A subset of `TagType`, so a status maps onto a card's status tag. */
export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

/** Options every cell builder passes straight through to `GridCellContent`. */
type CommonCellOpts = Pick<GridCellContent, "tooltip" | "sticky" | "colspan" | "css" | "aiMode" | "cardSlot">;

export type TextCellOpts = CommonCellOpts & {
  /** A string renders a link, a function renders a button styled as a link. Either way, it wraps only the text. */
  onClick?: string | VoidFunction;
  /** When `onClick` is a string, opens the link in a new tab. */
  openInNew?: boolean;
  /** When `onClick` is a string, downloads the linked file instead of navigating. */
  download?: boolean;
  /** Shows a colored dot before the text. Also becomes the card's status tag, unless `cardSlot` is passed. */
  status?: StatusType;
  /** Shows an icon after the text, e.g. a warning with a tooltip. */
  endIcon?: { icon: IconKey; tooltip?: string };
};

/**
 * Builds a body cell for plain text, optionally as a link, with a leading status dot and/or a trailing icon.
 *
 * - Flexible rows wrap the text; fixed rows clamp it to one line.
 * - `null`, `undefined` and `""` render the table's `emptyCell` ("-"), and hide the link, dot and icon.
 * - `value` (and so sorting, filtering and CSV) is the text.
 * - A cell with `onClick` is left out of the row's `rowLink` / `onClick`, so links don't nest.
 */
export function textCell(value: string | null | undefined, opts: TextCellOpts = {}): GridCellContent {
  const { onClick, openInNew, download, status, endIcon, cardSlot, ...common } = opts;

  if (value === null || value === undefined || value === "") {
    return { ...common, content: "", cardSlot };
  }

  return {
    ...common,
    content: () => (
      <CellText
        text={value}
        action={onClick ? { onClick, openInNew, download } : undefined}
        start={status && <StatusDot status={status} />}
        end={endIcon && <Icon icon={endIcon.icon} tooltip={endIcon.tooltip} inc={2} color={Tokens.OnSurfaceMuted} />}
      />
    ),
    value,
    ...(onClick && { onClick, openInNew, download, linkInContent: true }),
    cardSlot: cardSlot ?? (status ? cardStatusSlot({ text: value, type: status }) : undefined),
  };
}

function StatusDot({ status }: { status: StatusType }) {
  return <span aria-hidden css={Css.wPx(8).hPx(8).br100.fs0.bgColor(statusColors[status]).$} />;
}

const statusColors: Record<StatusType, Palette> = {
  success: Palette.Green600,
  warning: Palette.Orange600,
  error: Palette.Red600,
  info: Palette.Blue600,
  neutral: Palette.Gray600,
};
