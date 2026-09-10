import { useMemo, useRef, type RefObject } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { Button } from "src/components/Button";
import { Icon, type IconKey } from "src/components/Icon";
import { Css, Palette, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils/useTestIds";
import type { TableSummaryReportMetric, TableSummaryReportProps, TableSummaryReportStatus } from "./types";

export function TableSummaryReport<V extends string | number>(props: TableSummaryReportProps<V>) {
  const { title, totalLabel, segments, metrics = [], activeMetricValues = [], onMetricClick, issueAction } = props;
  const { sm: isMobile } = useBreakpoint();
  const tid = useTestIds(props, "tableSummaryReport");
  const visibleMetrics = metrics.slice(0, 4);
  const totalCount = useMemo(
    () => segments.reduce((total, segment) => total + Math.max(0, segment.count), 0),
    [segments],
  );

  return (
    <section css={Css.df.fdc.bgColor(Tokens.Surface).bc(Tokens.FieldBorderDefault).ba.br12.oh.bshBasic.$} {...tid}>
      <header css={Css.df.aic.jcsb.gap2.p2.bb.bc(Tokens.FieldBorderDefault).$}>
        <div css={Css.mdSb.mw0.$}>{title}</div>
        {visibleMetrics.length > 0 && issueAction && (
          <Button
            label={isMobile ? "Issues" : issueAction.label}
            variant="tertiary"
            icon={null}
            endAdornment={<Icon icon="arrowRight" />}
            onClick={issueAction.onClick}
            disabled={issueAction.disabled}
            {...tid.issueAction}
          />
        )}
      </header>
      {visibleMetrics.length > 0 && (
        <div css={Css.df.fdr.if(isMobile).fdc.$} {...tid.metrics}>
          {visibleMetrics.map((metric, index) => (
            <MetricButton
              key={String(metric.value)}
              metric={metric}
              active={activeMetricValues.includes(metric.value)}
              onClick={onMetricClick}
              divider={index < visibleMetrics.length - 1}
              mobile={isMobile}
              {...tid[`metric_${String(metric.value)}`]}
            />
          ))}
        </div>
      )}
      <footer
        css={Css.df.fdc.gap2.p2.if(visibleMetrics.length > 0).bt.bc(Tokens.FieldBorderDefault).$}
        {...tid.coverage}
      >
        <div css={Css.df.aic.jcsb.gap2.$}>
          <span css={Css.xs2Sb.ttu.add("letterSpacing", "0.5px").$}>Coverage by status</span>
          <span css={Css.xs.wsnw.$}>{totalLabel}</span>
        </div>
        <div css={Css.df.hPx(20).borderRadius("6px").oh.$} {...tid.coverageBar}>
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
      </footer>
    </section>
  );
}

type MetricButtonProps<V extends string | number> = {
  metric: TableSummaryReportMetric<V>;
  active: boolean;
  onClick: ((value: V) => void) | undefined;
  divider: boolean;
  mobile: boolean;
  "data-testid"?: string;
};

function MetricButton<V extends string | number>(props: MetricButtonProps<V>) {
  const { metric, active, onClick, divider, mobile } = props;
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps, isPressed } = useButton(
    { onPress: () => onClick?.(metric.value), isDisabled: metric.disabled, "aria-pressed": active },
    ref as RefObject<HTMLButtonElement>,
  );
  const { hoverProps, isHovered } = useHover({ isDisabled: metric.disabled });
  const { focusProps, isFocusVisible } = useFocusRing();
  const tid = useTestIds(props, "metric");

  return (
    <button
      ref={ref}
      css={{
        ...Css.buttonBase.df.flexGrow(1).aic.jcc.gap1.p2.mw0.bgColor(Tokens.Surface).color(Tokens.OnSurface).$,
        ...Css.if(divider && mobile).bb.bc(Tokens.FieldBorderDefault).$,
        ...Css.if(divider && !mobile).br.bc(Tokens.FieldBorderDefault).$,
        ...(isHovered && !metric.disabled ? Css.bgColor(Tokens.NeutralFillHoverSubtle).$ : {}),
        ...(isPressed || active ? Css.bgColor(Tokens.NeutralSurfacePressed).$ : {}),
        ...(isFocusVisible ? Css.bshFocus.$ : {}),
        ...(metric.disabled ? Css.cursorNotAllowed.o50.$ : Css.cursorPointer.$),
      }}
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      {...tid}
    >
      <Icon icon={statusIcons[metric.status]} color={statusColors[metric.status]} inc={4} />
      <span css={Css.lg.wsnw.$}>
        {metric.count} {metric.label}
      </span>
    </button>
  );
}

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((Math.max(0, count) / total) * 100);
}

const statusColors: Record<TableSummaryReportStatus, Palette> = {
  success: Palette.Green500,
  neutral: Palette.Gray500,
  warning: Palette.Orange500,
  error: Palette.Red500,
};

const statusIcons: Record<TableSummaryReportMetric<string | number>["status"], IconKey> = {
  warning: "errorCircle",
  error: "xCircle",
};
