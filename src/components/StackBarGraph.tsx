import { useMemo, type ReactNode } from "react";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type StackBarGraphProps = {
  title: ReactNode;
  totalLabel: ReactNode;
  segments: readonly StackBarGraphSegment[];
  "data-testid"?: string;
};

/** Horizontal stacked bar with a legend. Compose into `TableSummaryReport` via `footer`, or use standalone. */
export function StackBarGraph(props: StackBarGraphProps) {
  const { title, totalLabel, segments } = props;
  const tid = useTestIds(props, "stackBarGraph");
  const totalCount = useMemo(
    () => segments.reduce((total, segment) => total + Math.max(0, segment.count), 0),
    [segments],
  );

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
            css={
              Css.flexGrow(Math.max(0, segment.count))
                .add("minWidth", segment.count > 0 ? "1px" : 0)
                .bgColor(statusColors[segment.status]).$
            }
          />
        ))}
      </div>
      <div css={Css.df.fww.aic.gap2.$} {...tid.legend}>
        {segments.map((segment) => (
          <div key={segment.label} css={Css.dif.aic.gapPx(4).$}>
            <span css={Css.br100.wPx(8).hPx(8).bgColor(statusColors[segment.status]).$} />
            <span css={Css.xs.$}>
              {percentage(segment.count, totalCount)}% {segment.label} ({segment.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type StackBarGraphStatus = "success" | "neutral" | "warning" | "error";

export type StackBarGraphSegment = {
  label: string;
  count: number;
  status: StackBarGraphStatus;
};

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((Math.max(0, count) / total) * 100);
}

const statusColors: Record<StackBarGraphStatus, Palette> = {
  success: Palette.Green500,
  neutral: Palette.Gray500,
  warning: Palette.Orange500,
  error: Palette.Red500,
};
