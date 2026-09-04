import { ReactNode, useMemo } from "react";
import { ProposedValue, ProposedValueProps } from "src/components/ProposedValue";
import { CardBadgeTag } from "src/components/Table/cardSlots";
import { Tag } from "src/components/Tag";
import { Css, Palette, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

export type CardData = {
  label: string;
  value: ReactNode | string | number;
};

export type CardBodyProps = {
  title: string | ProposedValueProps;
  /** Meta text above the title. */
  leftEyebrow?: string | ProposedValueProps;
  rightEyebrow?: string | ProposedValueProps;
  badge?: string;
  badgeTags?: CardBadgeTag[];
  /** Rendered as two columns of `label: value` pairs. */
  data?: CardData[];
  /** A number between 0 and 100. Values outside this range are clamped. */
  progress?: number;
  /** Paints the progress track for the AI surface. */
  aiMode?: boolean;
  /** Set when trailing content (e.g. `BaseCard`'s `footer`) follows, so this skips its own bottom padding. */
  hasFooter?: boolean;
  /** Space above the header, before the hero. Defaults to 16px. */
  topGap?: number;
  /** Anything below the predefined slots, e.g. a card-type-specific table — owns its own bottom padding. */
  children?: ReactNode;
};

/**
 * The eyebrow/title/badge header, plus an optional data list and progress bar — the body shape
 * every card should share.
 */
export function CardBody(props: CardBodyProps) {
  const {
    title,
    leftEyebrow,
    rightEyebrow,
    badge,
    badgeTags,
    data = [],
    progress,
    aiMode = false,
    hasFooter = false,
    topGap = 16,
    children,
  } = props;
  const tid = useTestIds(props, "cardBody");
  const progressValue = useMemo(() => (progress !== undefined ? clampProgress(progress) : 0), [progress]);
  const hasDetails = data.length > 0 || progress !== undefined;
  const isLastSection = !hasFooter && !children;

  const col1 = data.slice(0, Math.ceil(data.length / 2));
  const col2 = data.slice(Math.ceil(data.length / 2));

  return (
    <div css={Css.df.fdc.gap2.fg1.mw0.ptPx(topGap).$}>
      {/* The hero is full-bleed, so this section pads its own sides; only the last section gets `pb3`. */}
      <div css={Css.df.fdc.gap1.px3.if(!hasDetails && isLastSection).pb3.$}>
        {(leftEyebrow || rightEyebrow) && (
          <div css={Css.df.jcsb.gap1.sm.color(Tokens.OnSurface).$} {...tid.eyebrow}>
            <span css={Css.truncate.$} {...tid.leftEyebrow}>
              {renderMaybeProposed(leftEyebrow, tid.leftEyebrowProposal)}
            </span>
            {rightEyebrow && (
              <span css={Css.fs0.$} {...tid.rightEyebrow}>
                {renderMaybeProposed(rightEyebrow, tid.rightEyebrowProposal)}
              </span>
            )}
          </div>
        )}
        <div css={Css.dif.w100.jcsb.aic.$}>
          <h4 css={Css.xl.lineClamp2.color(Tokens.OnSurface).$} {...tid.title}>
            {renderMaybeProposed(title, tid.titleProposal)}
          </h4>
          {(badge || badgeTags?.length) && (
            <div css={Css.dif.aic.gap1.fs0.$} {...tid.badge}>
              {badge && <span css={Css.sm.wsnw.$}>{badge}</span>}
              {badgeTags?.map((tag) => (
                <Tag key={tag.text} {...tag} />
              ))}
            </div>
          )}
        </div>
      </div>
      {hasDetails && (
        <div css={Css.df.fdc.gap2.mt("auto").px3.if(isLastSection).pb3.$}>
          {data.length > 0 && (
            <dl css={Css.df.gap2.sm.$}>
              <div css={Css.df.fdc.fg1.fb2.mw0.$}>
                {col1.map((d) => (
                  <div key={d.label} css={Css.df.gapPx(4).$} {...tid[defaultTestId(d.label)]}>
                    <dt css={Css.fs0.$}>{d.label}:</dt>
                    {/* `mw0` lets a long value — e.g. a `ProposedValue` carrying both halves — wrap
                        instead of widening the column. */}
                    <dd css={Css.mw0.$}>{d.value}</dd>
                  </div>
                ))}
              </div>
              <div css={Css.df.fdc.fg1.fb2.mw0.$}>
                {col2.map((d) => (
                  <div key={d.label} css={Css.df.gapPx(4).$} {...tid[defaultTestId(d.label)]}>
                    <dt css={Css.fs0.$}>{d.label}:</dt>
                    <dd css={Css.mw0.$}>{d.value}</dd>
                  </div>
                ))}
              </div>
            </dl>
          )}
          {progress !== undefined && (
            <div css={Css.df.aic.gap1.fs("10px").lh("14px").$}>
              {/* `SurfaceSubtle` is Gray200, which all but vanishes on the AI fill. */}
              <div
                css={Css.w25.hPx(8).br4.bgColor(aiMode ? Palette.Purple200 : Tokens.SurfaceSubtle).$}
                {...tid.progressTrack}
              >
                <div css={Css.h100.br4.bgBlue500.w(`${progressValue}%`).$} {...tid.progressFill} />
              </div>
              <span {...tid.progressValue}>{progressValue}%</span>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function renderMaybeProposed(value: string | ProposedValueProps | undefined, tid?: object): ReactNode {
  return typeof value === "string" || value === undefined ? value : <ProposedValue {...value} {...tid} />;
}

function clampProgress(value: number): number {
  if (process.env.NODE_ENV !== "production" && (value < 0 || value > 100)) {
    console.warn(`[CardBody] progress value ${value} is outside the expected range [0, 100] and will be clamped.`);
  }
  return Math.min(100, Math.max(0, value));
}
