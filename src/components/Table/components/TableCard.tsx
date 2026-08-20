import { ReactNode, useMemo } from "react";
import { useFocusRing } from "react-aria";
import { Link } from "react-router-dom";
import { Tag, Tooltip } from "src/components";
import { CardTag, ImageFitType } from "src/components/Card";
import { Carousel } from "src/components/Carousel";
import type {
  CardBadgeTag,
  CardCarouselFooter,
  CardCarouselThumbnail,
  CardInteractiveFooter,
} from "src/components/Table/cardSlots";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { RowStyle } from "src/components/Table/TableStyles";
import { GridColumnWithId, Kinded } from "src/components/Table/types";
import { RowState } from "src/components/Table/utils/RowState";
import { applyRowFn, isGridCellContent } from "src/components/Table/utils/utils";
import { Css, Tokens } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";
import { getButtonOrLink } from "src/utils/getInteractiveElement";

export type CardData = {
  label: string;
  value: ReactNode | string | number;
};

export type TableCardProps<R extends Kinded> = {
  rs: RowState<R>;
  columns: GridColumnWithId<R>[];
  rowStyle: RowStyle<any> | undefined;
  api: GridTableApi<R>;
  /** Fixed card height in px. Defaults to 430. */
  height?: number;
  /** How the hero image fills its frame. Defaults to `"cover"`. */
  imageFit?: ImageFitType;
};

export function TableCard<R extends Kinded>(props: TableCardProps<R>) {
  const { rs, columns, rowStyle, api, height, imageFit } = props;
  const tid = useTestIds(props, "tableCard");

  let title: string | undefined;
  let leftEyebrow: string | undefined;
  let rightEyebrow: string | undefined;
  let badge: string | undefined;
  let badgeTags: CardBadgeTag[] | undefined;
  let status: CardTag | undefined;
  let progress: number | undefined;
  let interactiveFooter: CardInteractiveFooter | undefined;
  const dataBlocks: CardData[] = [];

  for (const col of columns) {
    const raw = applyRowFn(col, rs.row, rs.api, rs.level, false);
    if (!isGridCellContent(raw)) continue;
    const slot = raw.cardSlot;
    if (!slot) continue;

    switch (slot.kind) {
      case "title":
        title = slot.text;
        break;
      case "leftEyebrow":
        leftEyebrow = slot.text;
        break;
      case "rightEyebrow":
        rightEyebrow = slot.text;
        break;
      case "badge":
        badge = slot.text;
        badgeTags = slot.tags;
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
      case "interactiveFooter":
        interactiveFooter = slot.footer;
        break;
    }
  }

  if (!title) return null;

  const onClick = rowStyle?.onClick;

  return (
    <TableCardView
      {...tid}
      imgSrc={rs.row.imgSrc ?? ""}
      title={title}
      leftEyebrow={leftEyebrow}
      rightEyebrow={rightEyebrow}
      badge={badge}
      badgeTags={badgeTags}
      status={status}
      data={dataBlocks}
      progress={progress}
      interactiveFooter={interactiveFooter}
      to={rowStyle?.rowLink?.(rs.row)}
      onClick={onClick ? () => onClick(rs.row, api) : undefined}
      height={height}
      imageFit={imageFit}
    />
  );
}

export type TableCardViewProps = {
  imgSrc: string;
  leftEyebrow?: string;
  rightEyebrow?: string;
  title: string;
  badge?: string;
  badgeTags?: CardBadgeTag[];
  data: CardData[];
  status?: CardTag;
  /** A number between 0 and 100. Values outside this range are clamped. */
  progress?: number;
  /** Footer with its own interactive controls, rendered outside the card's row action. */
  interactiveFooter?: CardInteractiveFooter;
  /** Makes the card's content a link. Takes precedence over `onClick`. */
  to?: string;
  /** Makes the card's content a button, for rows that act on click instead of navigating. */
  onClick?: () => void;
  /** Fixed card height in px. */
  height?: number;
  /** How the hero image fills its frame. Defaults to `"cover"`. */
  imageFit?: ImageFitType;
};

export function TableCardView(props: TableCardViewProps) {
  const {
    title,
    imgSrc,
    leftEyebrow,
    rightEyebrow,
    badge,
    badgeTags,
    data,
    status,
    progress,
    interactiveFooter,
    to,
    onClick,
    height = 430,
    imageFit = "cover",
  } = props;
  const tid = useTestIds(props, "tableCardView");
  // `getButtonOrLink` renders a link when passed a string, and a button otherwise.
  const action = to || onClick;
  const progressValue = useMemo(() => (progress !== undefined ? clampProgress(progress) : 0), [progress]);
  const shownFooter = shownInteractiveFooter(interactiveFooter);
  // The footer is a sibling of the action, so only the data/progress stack rides along inside of it.
  const hasDetails = data.length > 0 || progress !== undefined;

  const col1 = data.slice(0, Math.ceil(data.length / 2));
  const col2 = data.slice(Math.ceil(data.length / 2));

  const { isFocusVisible, focusProps } = useFocusRing();

  const actionAttrs = {
    ...tid.action,
    "aria-label": title,
    // `getButtonOrLink` renders its `<button>` without a type, which would default to submit inside a form.
    type: typeof action === "string" ? undefined : "button",
    ...Css.props(contentStyles),
    ...focusProps,
  };

  const content = (
    <>
      <div
        css={Css.relative.hPx(184).w100.bb.bc(Tokens.FieldBorderDefault).oh.borderRadius("12px 12px 0 0").$}
        {...tid.hero}
      >
        <img css={Css.h100.w100.objectFit(imageFit).$} src={imgSrc} alt={title} loading="lazy" {...tid.image} />
        {status && (
          <div css={Css.absolute.top1.left1.df.$} {...tid.status}>
            <Tag {...status} />
          </div>
        )}
      </div>
      {/* The hero is full-bleed, so each section pads itself and only the last one gets `pb3`. */}
      <div css={Css.df.fdc.gap1.px3.if(!hasDetails && !shownFooter).pb3.$}>
        {(leftEyebrow || rightEyebrow) && (
          <div css={Css.df.jcsb.gap1.sm.color(Tokens.OnSurface).$} {...tid.eyebrow}>
            <span css={Css.truncate.$} {...tid.leftEyebrow}>
              {leftEyebrow}
            </span>
            {rightEyebrow && (
              <span css={Css.fs0.$} {...tid.rightEyebrow}>
                {rightEyebrow}
              </span>
            )}
          </div>
        )}
        <div css={Css.dif.w100.jcsb.aic.$}>
          <h4 css={Css.xl.lineClamp2.color(Tokens.OnSurface).$} {...tid.title}>
            {title}
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
        <div css={Css.df.fdc.gap2.mt("auto").px3.if(!shownFooter).pb3.$}>
          {data.length > 0 && (
            <dl css={Css.df.gap2.sm.$}>
              <div css={Css.df.fdc.fg1.$}>
                {col1.map((d) => (
                  <div key={d.label} css={Css.df.gapPx(4).$} {...tid[defaultTestId(d.label)]}>
                    <dt>{d.label}:</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </div>
              <div css={Css.df.fdc.fg1.$}>
                {col2.map((d) => (
                  <div key={d.label} css={Css.df.gapPx(4).$} {...tid[defaultTestId(d.label)]}>
                    <dt>{d.label}:</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </div>
            </dl>
          )}
          {progress !== undefined && (
            <div css={Css.df.aic.gap1.fs("10px").lh("14px").$}>
              <div css={Css.w25.hPx(8).br4.bgColor(Tokens.SurfaceSubtle).$}>
                <div css={Css.h100.br4.bgBlue500.w(`${progressValue}%`).$} />
              </div>
              <span {...tid.progressValue}>{progressValue}%</span>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div
      css={{
        ...Css.w100.df.fdc.relative.ba.br12.bc(Tokens.FieldBorderDefault).bgColor(Tokens.SurfaceRaised).hPx(height)
          .cursorPointer.onHover.bshHover.$,
        ...(isFocusVisible ? Css.bshFocus.ba.$ : {}),
      }}
      {...tid}
    >
      {action ? (
        getButtonOrLink(content, action, actionAttrs)
      ) : (
        // Keep the same box as the action, so the card's layout doesn't depend on it being interactive.
        <div css={contentStyles}>{content}</div>
      )}
      {shownFooter && (
        <div css={Css.df.fdc.gap2.px3.pb3.pt2.$} {...tid.interactiveFooter}>
          <InteractiveFooter footer={shownFooter} tid={tid} />
        </div>
      )}
    </div>
  );
}

/** Renders the interactive footer union. Add new `CardInteractiveFooter` kinds here. */
function InteractiveFooter(props: { footer: CardInteractiveFooter; tid: ReturnType<typeof useTestIds> }) {
  const { footer, tid } = props;
  switch (footer.kind) {
    case "carousel":
      return <CarouselFooter footer={footer} tid={tid} />;
  }
}

type CarouselFooterProps = {
  footer: CardCarouselFooter;
  tid: ReturnType<typeof useTestIds>;
};

function CarouselFooter(props: CarouselFooterProps) {
  const { footer, tid } = props;
  return (
    <>
      <div css={Css.sm.$} {...tid.carouselTitle}>
        {footer.title}
      </div>
      <Carousel {...tid.carousel}>
        {footer.thumbnails.map((item) => (
          <Thumbnail key={item.id} item={item} tid={tid.carousel_item} />
        ))}
      </Carousel>
    </>
  );
}

function shownInteractiveFooter(footer: CardInteractiveFooter | undefined): CardInteractiveFooter | undefined {
  if (!footer) return undefined;
  switch (footer.kind) {
    case "carousel":
      return footer.thumbnails.length > 0 ? footer : undefined;
  }
}

type ThumbnailProps = {
  item: CardCarouselThumbnail;
  tid: object;
};

function Thumbnail(props: ThumbnailProps) {
  const { item, tid } = props;
  return (
    <Tooltip title={item.label} placement="top">
      <Link
        to={item.to}
        aria-label={item.label}
        className={navLink}
        {...tid}
        css={
          // The opaque swatch covers the link's own background, so the pressed state tints it with an `::after` on top.
          Css.relative.db.fs0
            .hPx(32)
            .wPx(32)
            .br8.ba.bcGray300.bgWhite.outline(0)
            .onHover.bshHover.end.onFocusVisible.bshFocus.end.onActive.bcBlue600.element("::after")
            .contentEmpty.absolute.top0.left0.w100.h100.br8.bgBlue600.o(0.28)
            .add("pointerEvents", "none").$
        }
      >
        {/* `oh` clips the swatch to the border radius; it can't live on the link, which would clip its focus ring. */}
        <span css={Css.db.w100.h100.oh.br8.$}>
          <img css={Css.w100.h100.objectFit("cover").db.$} src={item.imgUrl} alt="" loading="lazy" />
        </span>
      </Link>
    </Tooltip>
  );
}

function clampProgress(value: number): number {
  if (process.env.NODE_ENV !== "production" && (value < 0 || value > 100)) {
    console.warn(`[TableCard] progress value ${value} is outside the expected range [0, 100] and will be clamped.`);
  }
  return Math.min(100, Math.max(0, value));
}

/**
 * The box holding everything above the interactive footer, i.e. the card's link/button, or a plain
 * div for a static card.
 */
const contentStyles = Css.df.fdc.gap2.fg1.mw0.w100.tal.bn.p0.bgTransparent.color("unset").tdn.outline(0).$;
