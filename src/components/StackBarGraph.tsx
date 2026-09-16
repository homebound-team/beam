import type { ReactNode } from "react";
import type { BeamColor } from "src/colors";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type StackBarGraphProps = {
  title: ReactNode;
  totalLabel: ReactNode;
  segments: readonly StackBarGraphSegment[];
};

/** Horizontal stacked bar with a legend. Compose into `TableSummary` via `footer`, or use standalone. */
export function StackBarGraph(props: StackBarGraphProps) {
  const { title, totalLabel, segments } = props;
  const tid = useTestIds(props, "stackBarGraph");
  const totalCount = segments.reduce((total, segment) => total + Math.max(0, segment.count), 0);

  return (
    <div css={Css.df.fdc.gap2.p2.$} {...tid}>
      <div css={Css.df.aic.jcsb.gap2.$}>
        <span css={Css.xs2Sb.ttu.add("letterSpacing", "0.5px").$}>{title}</span>
        <span css={Css.xs.wsnw.$}>{totalLabel}</span>
      </div>
      <div css={Css.df.hPx(20).borderRadius("6px").oh.$} {...tid.bar}>
        {segments.map((segment) => (
          <div
            key={segment.label}
            css={Css.w(`${segmentWidth(segment.count, totalCount)}%`).fs0.bgColor(segment.color).$}
          />
        ))}
      </div>
      <div css={Css.df.fww.aic.gap2.$} {...tid.legend}>
        {segments.map((segment) => (
          <div key={segment.label} css={Css.dif.aic.gapPx(4).$}>
            <span css={Css.br100.wPx(8).hPx(8).bgColor(segment.color).$} />
            <span css={Css.xs.$}>
              {percentage(segment.count, totalCount)}% {segment.label} ({segment.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type StackBarGraphSegment = {
  label: string;
  count: number;
  color: BeamColor;
};

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((Math.max(0, count) / total) * 100);
}

function segmentWidth(count: number, total: number): number {
  return total === 0 ? 0 : (Math.max(0, count) / total) * 100;
}
