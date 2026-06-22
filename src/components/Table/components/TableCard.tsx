import { ReactNode } from "react";
import { AriaProgressBarProps } from "react-aria";
import { Link } from "react-router-dom";
import { Tag, TagProps, TagXss } from "src/components";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { RowStyle } from "src/components/Table/TableStyles";
import { CardProperty, GridColumnWithId, Kinded } from "src/components/Table/types";
import { RowState } from "src/components/Table/utils/RowState";
import { applyRowFn, isGridCellContent } from "src/components/Table/utils/utils";
import { Css, Only, Tokens, Xss } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { GridCellValue } from "./cell";

export type CardData = {
  header: string;
  value: GridCellValue;
};

export type TableCardProps<R extends Kinded> = {
  rs: RowState<R>;
  cardColumns: GridColumnWithId<R>[];
  rowStyle: RowStyle<any> | undefined;
  api: GridTableApi<R>;
};

export function TableCard<R extends Kinded>({ rs, cardColumns, rowStyle, api }: TableCardProps<R>) {
  let title: GridCellValue = "";
  let eyebrow: GridCellValue;
  let badge: GridCellValue;
  let status: TagProps<any> | undefined;
  const dataBlocks: CardData[] = [];
  let progress: AriaProgressBarProps | undefined;

  for (const col of cardColumns) {
    const prop = col.cardProperty;
    if (!prop) continue;
    const kind = typeof prop === "object" ? prop.kind : prop;
    const raw = applyRowFn(col, rs.row, rs.api, rs.level, false);
    const maybeValue = isGridCellContent(raw) ? raw.value : undefined;
    const cellValue: GridCellValue =
      typeof maybeValue === "function"
        ? maybeValue()
        : (maybeValue ??
          (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean" ? raw : undefined));

    if (
      cellValue === undefined &&
      kind !== CardProperty.Progress &&
      kind !== CardProperty.Status &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        `[GridTable] cardProperty "${kind}" on column "${col.id}" produced no GridCellValue. ` +
          `Set a value field on GridCellContent when using cardProperty.`,
      );
    }

    switch (kind) {
      case CardProperty.Title:
        title = cellValue;
        break;
      case CardProperty.Eyebrow:
        eyebrow = cellValue;
        break;
      case CardProperty.Badge:
        badge = cellValue;
        break;
      case CardProperty.DataBlock: {
        const label =
          typeof prop === "object" && "label" in prop
            ? (prop.label ?? col.name ?? col.id ?? "")
            : (col.name ?? col.id ?? "");
        dataBlocks.push({ header: label, value: cellValue });
        break;
      }
      case CardProperty.Progress:
        if (typeof prop === "object" && prop.kind === CardProperty.Progress) {
          progress = { label: col.name ?? "", value: prop.getValue(rs.row.data as any), minValue: 0, maxValue: 100 };
        }
        break;
      case CardProperty.Status:
        if (typeof prop === "object" && prop.kind === CardProperty.Status) {
          status = prop.getValue(rs.row.data as any);
        }
        break;
    }
  }

  if (!title) return null;

  const card = (
    <TableCardView
      data-testid={`card_${rs.row.id}`}
      imgSrc={(rs.row as any).imgSrc ?? ""}
      title={title}
      eyebrow={eyebrow}
      badge={badge}
      status={status}
      data={dataBlocks}
      progress={progress}
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

function toDisplay(value: GridCellValue): ReactNode {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

export type TableCardViewProps<X> = {
  imgSrc: string;
  eyebrow?: GridCellValue;
  title: GridCellValue;
  badge?: GridCellValue;
  data: CardData[];
  status?: TagProps<X>;
  progress?: AriaProgressBarProps;
};

export function TableCardView<X extends Only<Xss<TagXss>, X>>(props: TableCardViewProps<X>) {
  const { title, imgSrc, eyebrow, badge, data, status, progress } = props;
  const tid = useTestIds(props, "tableCardView");

  return (
    <div css={Css.p3.w("330px").h("100%").bshBasic.bgColor(Tokens.Surface).df.fdc.gap2.$} {...tid}>
      <div css={Css.relative.$}>
        <img css={Css.h("184px").w("100%").objectFit("cover").$} src={imgSrc} alt={String(title)} {...tid.image} />
        {status && (
          <div css={Css.absolute.top1.left1.$} {...tid.status}>
            <Tag {...status} />
          </div>
        )}
      </div>
      <div css={Css.df.fdc.gap2.$}>
        <div>
          {eyebrow && (
            <p css={Css.sm.$} {...tid.eyebrow}>
              {toDisplay(eyebrow)}
            </p>
          )}
          {title && (
            <div css={Css.dif.w100.jcsb.aic.$}>
              <h4 css={Css.xl.fwb.$} {...tid.title}>
                {toDisplay(title)}{" "}
              </h4>
              {badge && (
                <span css={Css.sm.wsnw.$} {...tid.badge}>
                  {toDisplay(badge)}
                </span>
              )}
            </div>
          )}
        </div>
        {data && data?.length > 0 && (
          <div css={Css.dg.gtc("1fr 1fr").sm.$}>
            {data.map((d, idx) => (
              <p
                key={`${d.header}-${d.value}`}
                css={Css.gc((idx % 2) + 1).$}
                {...tid[defaultTestId(d.header)]}
              >{`${d.header}: ${d.value}`}</p>
            ))}
          </div>
        )}
        {progress && (
          <div css={Css.df.fdc.gap1.$}>
            <div css={Css.df.aic.gap1.fs("10px").lh("14px").$}>
              <div css={Css.w25.hPx(8).br4.bgGray200.$}>
                <div css={Css.h100.br4.bgBlue500.w(`${progress.value}%`).$} />
              </div>
              <span {...tid.progressValue}>{progress.value}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
