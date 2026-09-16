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
    <section css={Css.df.fdc.bgColor(Tokens.SurfaceRaised).br12.bshBasic.$} {...tid}>
      <header css={Css.df.aic.jcsb.gap2.px2.pyPx(12).bb.bc(Tokens.SurfaceSeparator).$}>
        <h3 css={Css.mdSb.mw0.py1.m0.$}>{title}</h3>
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
          {metrics.map((metric, index) => (
            <MetricButton
              key={defaultTestId(metric.label)}
              metric={metric}
              divider={index < metrics.length - 1}
              {...tid[`metric_${defaultTestId(metric.label)}`]}
            />
          ))}
        </div>
      )}
      {footer && <div css={Css.if(metrics.length > 0).bt.bc(Tokens.SurfaceSeparator).$}>{footer}</div>}
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
        ...Css.outline0.relative.df.fg1.aic.jcc.gap1.p2.mw0.bgColor(Tokens.SurfaceRaised).color(Tokens.OnSurface)
          .cursorPointer.$,
        // Desktop: right divider; small screens: bottom divider (and clear the right edge).
        ...Css.if(divider).br.bc(Tokens.SurfaceSeparator).ifSm.bb.bc(Tokens.SurfaceSeparator).add("borderRight", "none")
          .$,
        ...(isHovered ? Css.bgColor(Tokens.NeutralFillHoverSubtle).$ : {}),
        // Single blue ring (bshFocus's outer color). FocusRingMuted is near-black — not for these cells.
        ...(isFocusVisible ? Css.boxShadow(`0px 0px 0px 2px ${Palette.Blue700}`).z1.$ : {}),
      }}
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      {...tid}
    >
      <span css={Css.fs0.$}>
        <Icon icon={metric.icon} color={metric.color} inc={4} />
      </span>
      <span css={Css.lg.$}>
        {metric.count} {metric.label}
      </span>
    </button>
  );
}
