import { ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { Tag } from "src/components";
import { CardTag } from "src/components/Card";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { RowStyle } from "src/components/Table/TableStyles";
import { GridColumnWithId, Kinded } from "src/components/Table/types";
import { RowState } from "src/components/Table/utils/RowState";
import { applyRowFn, isGridCellContent } from "src/components/Table/utils/utils";
import { Css, Tokens } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type CardData = {
  label: string;
  value: ReactNode | string | number;
};

export type TableCardProps<R extends Kinded> = {
  rs: RowState<R>;
  columns: GridColumnWithId<R>[];
  rowStyle: RowStyle<any> | undefined;
  api: GridTableApi<R>;
};

export function TableCard<R extends Kinded>(props: TableCardProps<R>) {
  const { rs, columns, rowStyle, api } = props;
  const tid = useTestIds(props, "tableCard");

  let title: string | undefined;
  let eyebrow: string | undefined;
  let badge: string | undefined;
  let status: CardTag | undefined;
  const dataBlocks: CardData[] = [];
  let progress: number | undefined;

  for (const col of columns) {
    const raw = applyRowFn(col, rs.row, rs.api, rs.level, false);
    if (!isGridCellContent(raw)) continue;
    const slot = raw.cardSlot;
    if (!slot) continue;

    switch (slot.kind) {
      case "title":
        title = slot.text;
        break;
      case "eyebrow":
        eyebrow = slot.text;
        break;
      case "badge":
        badge = slot.text;
        break;
      case "status":
        status = slot.tag;
        break;
      case "dataBlock":
        dataBlocks.push({ label: slot.label, value: slot.value });
        break;
      case "progress":
        progress = slot.value;
        break;
    }
  }

  if (!title) return null;

  const card = (
    <TableCardView
      {...tid}
      imgSrc={rs.row.imgSrc ?? ""}
      title={title}
      eyebrow={eyebrow}
      badge={badge}
      status={status}
      data={dataBlocks}
      progress={progress}
    />
  );

  const to = rowStyle?.rowLink?.(rs.row);
  if (to) {
    return (
      <Link to={to} css={Css.tdn.color("unset").$} className={navLink}>
        {card}
      </Link>
    );
  }
  if (rowStyle?.onClick) {
    return (
      <button onClick={() => rowStyle.onClick!(rs.row, api)} css={Css.cursorPointer.$}>
        {card}
      </button>
    );
  }
  return card;
}

export type TableCardViewProps = {
  imgSrc: string;
  eyebrow?: string;
  title: string;
  badge?: string;
  data: CardData[];
  status?: CardTag;
  /** A number between 0 and 100. Values outside this range are clamped. */
  progress?: number;
};

export function TableCardView(props: TableCardViewProps) {
  const { title, imgSrc, eyebrow, badge, data, status, progress } = props;
  const tid = useTestIds(props, "tableCardView");

  const progressValue = useMemo(() => (progress !== undefined ? clampProgress(progress) : 0), [progress]);

  return (
    <div css={Css.p3.w100.h100.bshBasic.bgColor(Tokens.Surface).df.fdc.gap2.$} {...tid}>
      <div css={Css.relative.$}>
        <img css={Css.hPx(184).w100.objectFit("cover").$} src={imgSrc} alt={title} {...tid.image} />
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
              {eyebrow}
            </p>
          )}
          {title && (
            <div css={Css.dif.w100.jcsb.aic.$}>
              <h4 css={Css.xl.fwb.$} {...tid.title}>
                {title}{" "}
              </h4>
              {badge && (
                <span css={Css.sm.wsnw.$} {...tid.badge}>
                  {badge}
                </span>
              )}
            </div>
          )}
        </div>
        {data && data?.length > 0 && (
          <dl css={Css.dg.gtc("repeat(2, minmax(0, 1fr))").sm.$}>
            {data.map((d, idx) => (
              <div key={d.label} css={Css.df.gapPx(4).gc((idx % 2) + 1).$} {...tid[defaultTestId(d.label)]}>
                <dt>{d.label}:</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {progress !== undefined && (
          <div css={Css.df.fdc.gap1.$}>
            <div css={Css.df.aic.gap1.fs("10px").lh("14px").$}>
              <div css={Css.w25.hPx(8).br4.bgGray200.$}>
                <div css={Css.h100.br4.bgBlue500.w(`${progressValue}%`).$} />
              </div>
              <span {...tid.progressValue}>{progressValue}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function clampProgress(value: number): number {
  if (process.env.NODE_ENV !== "production" && (value < 0 || value > 100)) {
    console.warn(`[TableCard] progress value ${value} is outside the expected range [0, 100] and will be clamped.`);
  }
  return Math.min(100, Math.max(0, value));
}
