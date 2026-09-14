import { useRef, type ReactNode, type RefObject } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import { Button } from "src/components/Button";
import { Icon, type IconKey } from "src/components/Icon";
import { Css, Palette, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils/useTestIds";

export type TableSummaryStatus = "success" | "neutral" | "warning" | "error";

export type TableSummaryMetric<V extends string | number> = {
  value: V;
  label: string;
  count: number;
  status: Exclude<TableSummaryStatus, "neutral" | "success">;
  disabled?: boolean;
};

export type TableSummaryProps<V extends string | number> = {
  title: ReactNode;
  metrics?: readonly TableSummaryMetric<V>[];
  activeMetricValues?: readonly V[];
  onMetricClick?: (value: V) => void;
  statusLabel?: ReactNode;
  statusMobileLabel?: ReactNode;
  onStatusClick?: VoidFunction;
  statusDisabled?: boolean;
  footer?: ReactNode;
};

export function TableSummary<V extends string | number>(props: TableSummaryProps<V>) {
  const {
    title,
    metrics = [],
    activeMetricValues = [],
    onMetricClick,
    statusLabel,
    statusMobileLabel = "Items",
    onStatusClick,
    statusDisabled,
    footer,
  } = props;
  const { sm: isMobile } = useBreakpoint();
  const tid = useTestIds(props, "tableSummary");

  return (
    <section css={Css.df.fdc.bgColor(Tokens.Surface).br12.bshBasic.$} {...tid}>
      <header css={Css.df.aic.jcsb.gap2.px2.pyPx(12).bb.bc(Tokens.FieldBorderDefault).$}>
        <div css={Css.mdSb.mw0.py1.$}>{title}</div>
        {metrics.length > 0 && statusLabel != null && onStatusClick && (
          <Button
            label={isMobile ? statusMobileLabel : statusLabel}
            variant="tertiary"
            endAdornment={<Icon icon="arrowRight" />}
            onClick={onStatusClick}
            disabled={statusDisabled}
            {...tid.statusAction}
          />
        )}
      </header>
      {metrics.length > 0 && (
        <div css={Css.df.fdr.if(isMobile).fdc.$} {...tid.metrics}>
          {metrics.map((metric, index) => (
            <MetricButton
              key={String(metric.value)}
              metric={metric}
              active={activeMetricValues.includes(metric.value)}
              onClick={onMetricClick}
              divider={index < metrics.length - 1}
              mobile={isMobile}
              {...tid[`metric_${String(metric.value)}`]}
            />
          ))}
        </div>
      )}
      {footer !== undefined && <div css={Css.if(metrics.length > 0).bt.bc(Tokens.FieldBorderDefault).$}>{footer}</div>}
    </section>
  );
}

type MetricButtonProps<V extends string | number> = {
  metric: TableSummaryMetric<V>;
  active: boolean;
  onClick: ((value: V) => void) | undefined;
  divider: boolean;
  mobile: boolean;
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
        ...Css.df.fg1.aic.jcc.gap1.p2.mw0.bgColor(Tokens.Surface).color(Tokens.OnSurface).$,
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

const statusColors: Record<TableSummaryStatus, Palette> = {
  success: Palette.Green500,
  neutral: Palette.Gray500,
  warning: Palette.Orange500,
  error: Palette.Red500,
};

const statusIcons: Record<TableSummaryMetric<string | number>["status"], IconKey> = {
  warning: "errorCircle",
  error: "xCircle",
};
