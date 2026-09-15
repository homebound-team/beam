import { useRef, type ReactNode } from "react";
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

/** Optional header text-button CTA (e.g. "View Items"). */
export type TableSummaryAction = {
  label: ReactNode;
  /** Shown below the `sm` breakpoint. Defaults to `"Items"`. */
  mobileLabel?: ReactNode;
  onClick: VoidFunction;
  disabled?: boolean;
};

export type TableSummaryProps<V extends string | number> = {
  title: ReactNode;
  metrics?: readonly TableSummaryMetric<V>[];
  activeMetricValues?: readonly V[];
  onMetricClick?: (value: V) => void;
  action?: TableSummaryAction;
  footer?: ReactNode;
};

export function TableSummary<V extends string | number>(props: TableSummaryProps<V>) {
  const { title, metrics = [], activeMetricValues = [], onMetricClick, action, footer } = props;
  const { sm: isMobile } = useBreakpoint();
  const tid = useTestIds(props, "tableSummary");
  const actionMobileLabel = action?.mobileLabel ?? "Items";

  return (
    <section css={Css.df.fdc.bgColor(Tokens.Surface).br12.bshBasic.$} {...tid}>
      <header css={Css.df.aic.jcsb.gap2.px2.pyPx(12).bb.bc(Tokens.FieldBorderDefault).$}>
        <div css={Css.mdSb.mw0.py1.$}>{title}</div>
        {action && (
          <span css={Css.sm.$}>
            <Button
              label={isMobile ? actionMobileLabel : action.label}
              variant="text"
              endAdornment={<Icon icon="arrowRight" />}
              onClick={action.onClick}
              disabled={action.disabled}
              {...tid.action}
            />
          </span>
        )}
      </header>
      {metrics.length > 0 && (
        <div css={Css.df.fdr.ifSm.fdc.$} {...tid.metrics}>
          {metrics.map((metric, index) => (
            <MetricButton
              key={String(metric.value)}
              metric={metric}
              active={activeMetricValues.includes(metric.value)}
              onClick={onMetricClick}
              divider={index < metrics.length - 1}
              {...tid[`metric_${String(metric.value)}`]}
            />
          ))}
        </div>
      )}
      {footer && <div css={Css.if(metrics.length > 0).bt.bc(Tokens.FieldBorderDefault).$}>{footer}</div>}
    </section>
  );
}

type MetricButtonProps<V extends string | number> = {
  metric: TableSummaryMetric<V>;
  active: boolean;
  onClick: ((value: V) => void) | undefined;
  divider: boolean;
};

function MetricButton<V extends string | number>(props: MetricButtonProps<V>) {
  const { metric, active, onClick, divider } = props;
  const ref = useRef(null);
  const { buttonProps } = useButton(
    { onPress: () => onClick?.(metric.value), isDisabled: metric.disabled, "aria-pressed": active },
    ref,
  );
  const { hoverProps, isHovered } = useHover({ isDisabled: metric.disabled });
  const { focusProps, isFocusVisible } = useFocusRing();
  const tid = useTestIds(props, "metric");

  return (
    <button
      ref={ref}
      css={{
        // outline0 drops the UA focus outline (avoids a second ring beside our box-shadow).
        // relative + z1 paints the focused cell above neighbors so the ring isn't tucked under.
        ...Css.outline0.relative.df.fg1.aic.jcc.gap1.p2.mw0.bgColor(Tokens.Surface).color(Tokens.OnSurface).$,
        // Desktop: right divider; small screens: bottom divider (and clear the right edge).
        ...Css.if(divider)
          .br.bc(Tokens.FieldBorderDefault)
          .ifSm.bb.bc(Tokens.FieldBorderDefault)
          .add("borderRight", "none").$,
        ...(isHovered && !metric.disabled ? Css.bgColor(Tokens.NeutralFillHoverSubtle).$ : {}),
        // Single blue ring (bshFocus's outer color). FocusRingMuted is near-black — not for these cells.
        ...(isFocusVisible ? Css.boxShadow(`0px 0px 0px 2px ${Palette.Blue700}`).z1.$ : {}),
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
