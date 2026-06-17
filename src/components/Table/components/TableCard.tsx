import { AriaProgressBarProps } from "react-aria";
import { Link } from "react-router-dom";
import { Tag, TagProps } from "src/components";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { RowStyle } from "src/components/Table/TableStyles";
import { CardProperty, GridColumnWithId, Kinded } from "src/components/Table/types";
import { RowState } from "src/components/Table/utils/RowState";
import { applyRowFn, isGridCellContent } from "src/components/Table/utils/utils";
import { Css, Tokens } from "src/Css";
import { navLink } from "src/css/CssReset";

export type CardData = {
  header: string;
  value: string;
};

export type TableCardProps<R extends Kinded> = {
  rs: RowState<R>;
  cardColumns: GridColumnWithId<R>[];
  rowStyle: RowStyle<any> | undefined;
  api: GridTableApi<R>;
};

export function TableCard<R extends Kinded>({ rs, cardColumns, rowStyle, api }: TableCardProps<R>) {
  let title = "";
  let eyebrow: string | undefined;
  let badge: string | undefined;
  const dataBlocks: CardData[] = [];

  for (const col of cardColumns) {
    const raw = applyRowFn(col, rs.row, rs.api, rs.level, false);
    const value = isGridCellContent(raw) ? String(raw.value ?? raw.content ?? "") : String(raw ?? "");

    switch (col.cardProperty) {
      case CardProperty.Title:
        title = value;
        break;
      case CardProperty.Eyebrow:
        eyebrow = value;
        break;
      case CardProperty.Badge:
        badge = value;
        break;
      case CardProperty.DataBlock:
        dataBlocks.push({ header: col.name ?? col.id ?? "", value });
        break;
      // Status and Progress require structured prop shapes (TagProps, AriaProgressBarProps) — left for future extension.
    }
  }

  if (!title) return null;

  const card = (
    <TableCardView
      imgSrc={(rs.row as any).imgSrc ?? ""}
      title={title}
      eyebrow={eyebrow}
      badge={badge}
      data={dataBlocks}
    />
  );

  const to = rowStyle?.rowLink?.(rs.row as any);
  if (to) {
    return (
      <Link to={to} css={Css.tdn.color("unset").$} className={navLink}>
        {card}
      </Link>
    );
  }
  if (rowStyle?.onClick) {
    return (
      <div onClick={() => rowStyle.onClick!(rs.row as any, api)} css={Css.cursorPointer.$}>
        {card}
      </div>
    );
  }
  return card;
}

// TODO: handle generic typing
export type TableCardViewProps = {
  imgSrc: string;
  eyebrow?: string;
  title: string;
  badge?: string;
  data: CardData[];
  status?: TagProps<any>;
  progress?: AriaProgressBarProps;
};

export const TableCardView = (props: TableCardViewProps) => {
  const { title, imgSrc, eyebrow, badge, data, status, progress } = props;

  const imageElement = <img css={Css.w("100%").objectFit("contain").$} src={imgSrc} alt={title} />;

  const titleElement = (
    <h4 css={Css.md.fwb.$}>
      {title} {badge && <span css={Css.sm.$}>{badge}</span>}
    </h4>
  );

  const dataElement = (
    <div css={Css.dg.gtc("1fr 1fr").$}>
      {data.map((d, idx) => (
        <p key={`${d.header}-${d.value}`} css={Css.gc((idx % 2) + 1).$}>{`${d.header}: ${d.value}`}</p>
      ))}
    </div>
  );

  return (
    <div css={Css.p3.w("396px").bshBasic.bgColor(Tokens.Surface).$}>
      {status && <Tag {...status} />}
      {imgSrc && imageElement}
      {eyebrow && <p css={Css.sm.$}>{eyebrow}</p>}
      {title && titleElement}
      {data && data?.length > 0 && dataElement}
      {progress && <p>Progress here</p>}
    </div>
  );
};
