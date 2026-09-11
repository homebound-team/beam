import { useRef, type ReactNode, type RefObject } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { Button } from "src/components/Button";
import { Icon, type IconKey } from "src/components/Icon";
import { Css, Palette, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils/useTestIds";

export type TableSummaryReportStatus = "success" | "neutral" | "warning" | "error";

export type TableSummaryReportMetric<V extends string | number> = {
  value: V;
  label: string;
  count: number;
  status: Exclude<TableSummaryReportStatus, "neutral" | "success">;
  disabled?: boolean;
};

export type TableSummaryReportProps<V extends string | number> = {
  title: ReactNode;
  metrics?: readonly TableSummaryReportMetric<V>[];
  activeMetricValues?: readonly V[];
  onMetricClick?: (value: V) => void;
  issueLabel?: ReactNode;
  issueMobileLabel?: ReactNode;
  onIssueClick?: VoidFunction;
  issueDisabled?: boolean;
  footer?: ReactNode;
  "data-testid"?: string;
};

export function TableSummaryReport<V extends string | number>(props: TableSummaryReportProps<V>) {
  const {
    title,
    metrics = [],
    activeMetricValues = [],
    onMetricClick,
    issueLabel,
    issueMobileLabel = "Issues",
    onIssueClick,
    issueDisabled,
    footer,
  } = props;
  const { sm: isMobile } = useBreakpoint();
  const tid = useTestIds(props, "tableSummaryReport");
  const visibleMetrics = metrics.slice(0, 4);

  return (
    <section css={Css.df.fdc.bgColor(Tokens.Surface).br12.oh.bshBasic.$} {...tid}>
      <header css={Css.df.aic.jcsb.gap2.px2.pyPx(12).bb.bc(Tokens.FieldBorderDefault).$}>
        <div css={Css.mdSb.mw0.py1.$}>{title}</div>
        {visibleMetrics.length > 0 && issueLabel != null && onIssueClick && (
          <Button
            label={isMobile ? issueMobileLabel : issueLabel}
            variant="tertiary"
            icon={null}
            endAdornment={<Icon icon="arrowRight" />}
            onClick={onIssueClick}
            disabled={issueDisabled}
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
      {footer !== undefined && (
        <div css={Css.if(visibleMetrics.length > 0).bt.bc(Tokens.FieldBorderDefault).$}>{footer}</div>
      )}
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
