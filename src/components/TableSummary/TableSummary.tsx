import { useRef, type ReactNode } from "react";
import { mergeProps, useButton, useFocusRing, useHover } from "react-aria";
import type { BeamColor } from "src/colors";
import { Button } from "src/components/Button";
import { Icon, type IconKey } from "src/components/Icon";
import { Css, Palette, Tokens } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { defaultTestId } from "src/utils/defaultTestId";
import { useTestIds } from "src/utils/useTestIds";

export type TableSummaryMetric = {
  label: string;
  count: number;
  icon: IconKey;
  color: BeamColor;
  onClick?: VoidFunction;
};

/** Optional header text-button CTA (e.g. "View Items"). */
export type TableSummaryAction = {
  label: ReactNode;
  /** Shown below the `sm` breakpoint. Defaults to `"Items"`. */
  mobileLabel?: ReactNode;
  onClick: VoidFunction;
};

export type TableSummaryProps = {
  title: ReactNode;
  metrics?: readonly TableSummaryMetric[];
  action?: TableSummaryAction;
  footer?: ReactNode;
};

export function TableSummary(props: TableSummaryProps) {
  const { title, metrics = [], action, footer } = props;
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
              {...tid.action}
            />
          </span>
        )}
      </header>
      {metrics.length > 0 && (
        <div css={Css.df.fdr.ifSm.fdc.$} {...tid.metrics}>
          {metrics.map((metric, index) => {
            const metricId = defaultTestId(metric.label);
            return (
              <MetricButton
                key={metricId}
                metric={metric}
                divider={index < metrics.length - 1}
                {...tid[`metric_${metricId}`]}
              />
            );
          })}
        </div>
      )}
      {footer && <div css={Css.if(metrics.length > 0).bt.bc(Tokens.FieldBorderDefault).$}>{footer}</div>}
    </section>
  );
}

type MetricButtonProps = {
  metric: TableSummaryMetric;
  divider: boolean;
};

function MetricButton(props: MetricButtonProps) {
  const { metric, divider } = props;
  const ref = useRef(null);
  const { buttonProps } = useButton({ onPress: () => metric.onClick?.() }, ref);
  const { hoverProps, isHovered } = useHover({});
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
        ...(isHovered ? Css.bgColor(Tokens.NeutralFillHoverSubtle).$ : {}),
        // Single blue ring (bshFocus's outer color). FocusRingMuted is near-black — not for these cells.
        ...(isFocusVisible ? Css.boxShadow(`0px 0px 0px 2px ${Palette.Blue700}`).z1.$ : {}),
        ...Css.cursorPointer.$,
      }}
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      {...tid}
    >
      <Icon icon={metric.icon} color={metric.color} inc={4} />
      <span css={Css.lg.wsnw.$}>
        {metric.count} {metric.label}
      </span>
    </button>
  );
}
