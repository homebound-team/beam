import { useResizeObserver } from "@react-aria/utils";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeProps, useFocusRing, useHover, usePress } from "react-aria";
import { Link } from "react-router-dom";
import { Icon, Tag, Tooltip } from "src/components";
import { CardTag, ImageFitType } from "src/components/Card";
import type { CardBadgeTag, CardCarouselThumbnail } from "src/components/Table/cardSlots";
import { GridTableApi } from "src/components/Table/GridTableApi";
import { RowStyle } from "src/components/Table/TableStyles";
import { GridColumnWithId, Kinded } from "src/components/Table/types";
import { RowState } from "src/components/Table/utils/RowState";
import { applyRowFn, isGridCellContent } from "src/components/Table/utils/utils";
import { Css, Tokens } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useTestIds } from "src/utils";
import { defaultTestId } from "src/utils/defaultTestId";

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
  let carousel: { title: string; thumbnails: CardCarouselThumbnail[] } | undefined;
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
      case "carousel":
        carousel = { title: slot.title, thumbnails: slot.thumbnails };
        break;
    }
  }

  const hasCarousel = !!carousel && carousel.thumbnails.length > 0;
  if (!title) return null;

  const to = rowStyle?.rowLink?.(rs.row);
  const onClick = rowStyle?.onClick;
  const handleClick = onClick ? () => onClick(rs.row, api) : undefined;

  const card = (
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
      carousel={carousel}
      // Carousel cards hold thumbnail links, so they cannot be wrapped in an <a>/<button>. Instead the view
      // stretches the row's action across the whole card, underneath the thumbnails, so both stay clickable.
      to={hasCarousel ? to : undefined}
      onClick={hasCarousel && !to ? handleClick : undefined}
      interactive={!!(to || handleClick)}
      height={height}
      imageFit={imageFit}
    />
  );

  if (hasCarousel) return card;

  if (to) {
    return (
      <Link to={to} css={Css.db.br12.tdn.color("unset").outline(0).onFocusVisible.bshFocus.$} className={navLink}>
        {card}
      </Link>
    );
  }
  if (handleClick) {
    return (
      <button
        onClick={handleClick}
        css={Css.bn.bgTransparent.p0.w100.br12.cursorPointer.outline(0).onFocusVisible.bshFocus.$}
      >
        {card}
      </button>
    );
  }
  return card;
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
  progress?: number;
  carousel?: { title: string; thumbnails: CardCarouselThumbnail[] };
  /** Stretches a link across the whole card, for cards that cannot be wrapped in an `<a>` (i.e. carousel cards). */
  to?: string;
  /** Stretches a button across the whole card, for cards that cannot be wrapped in a `<button>`. */
  onClick?: () => void;
  /** Pointer cursor and hover wash. Inferred from `to`/`onClick`; pass it when the caller wraps the card itself. */
  interactive?: boolean;
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
    carousel,
    to,
    onClick,
    interactive,
    height = 430,
    imageFit = "cover",
  } = props;
  const tid = useTestIds(props, "tableCardView");
  const isInteractive = interactive || !!to || !!onClick;
  const { hoverProps, isHovered } = useHover({ isDisabled: !isInteractive });
  // Only the stretched action rings the card; `within` would double up with the thumbnail/chevron rings.
  const { focusProps, isFocusVisible } = useFocusRing();
  const progressValue = useMemo(() => (progress !== undefined ? clampProgress(progress) : 0), [progress]);
  const shownCarousel = carousel && carousel.thumbnails.length > 0 ? carousel : undefined;
  const hasFooter = data.length > 0 || progress !== undefined || !!shownCarousel;

  const col1 = data.slice(0, Math.ceil(data.length / 2));
  const col2 = data.slice(Math.ceil(data.length / 2));

  const header = (
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
      <div css={Css.df.fdc.gap1.px3.if(!hasFooter).pb3.$}>
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
        {title && (
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
        )}
      </div>
    </>
  );

  return (
    <div
      css={{
        ...Css.w100
          .hPx(height)
          .ba.br12.bc(Tokens.FieldBorderDefault)
          .bgColor(Tokens.SurfaceRaised)
          .df.fdc.gap2.relative.if(isInteractive)
          .onHover.bc(Tokens.FieldBorderHover).onHover.cursorPointer.$,
        ...(isFocusVisible ? Css.bshFocus.$ : {}),
      }}
      {...hoverProps}
      {...tid}
    >
      <div css={Css.df.fdc.gap2.fg1.$}>{header}</div>
      {/* Card action must be before the carousel so tabbing first focuses the card action before any thumbnails  */}
      {to && (
        <Link to={to} aria-label={title} className={navLink} css={stretchedAction} {...focusProps} {...tid.action} />
      )}
      {!to && onClick && (
        <button
          type="button"
          aria-label={title}
          onClick={onClick}
          css={stretchedAction}
          {...focusProps}
          {...tid.action}
        />
      )}
      {hasFooter && (
        <div css={Css.df.fdc.gap2.mt("auto").px3.pb3.$}>
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
          {shownCarousel && (
            <div css={Css.df.fdc.gap2.$}>
              <div css={Css.sm.$} {...tid.carouselTitle}>
                {shownCarousel.title}
              </div>
              <Carousel thumbnails={shownCarousel.thumbnails} {...tid.carousel} />
            </div>
          )}
        </div>
      )}
      {isHovered && isInteractive && (
        <div
          aria-hidden
          css={Css.absolute.top0.left0.w100.h100.br12.z1.bgGray900.o(0.08).add("pointerEvents", "none").$}
          {...tid.hoverWash}
        />
      )}
    </div>
  );
}

type CarouselProps = {
  thumbnails: CardCarouselThumbnail[];
};

/** Horizontal thumbnail strip with overflow chevrons — private to TableCard. */
function Carousel(props: CarouselProps) {
  const { thumbnails } = props;
  const tid = useTestIds(props, "carousel");
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateOverflow = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useResizeObserver({ ref: stripRef, onResize: updateOverflow });

  useEffect(() => {
    updateOverflow();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateOverflow);
    return () => el.removeEventListener("scroll", updateOverflow);
  }, [updateOverflow, thumbnails.length]);

  function scrollByDir(dir: -1 | 1) {
    stripRef.current?.scrollBy({ left: dir * 96, behavior: "smooth" });
  }

  return (
    // z1 keeps the strip (and its wheel/trackpad scrolling) above the card's stretched action.
    <div css={Css.df.aic.relative.z1.$} {...tid}>
      <div css={Css.fs0.df.aic.jcc.hPx(32).$}>
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByDir(-1)}
            css={
              Css.bn.bgTransparent.p0.df.aic.jcc.cursorPointer.color(Tokens.OnSurface).outline(0).onFocusVisible
                .bshFocus.$
            }
            {...tid.prev}
          >
            <Icon icon="chevronLeft" inc={3} color={Tokens.OnSurface} />
          </button>
        )}
      </div>
      <div css={Css.relative.fg1.mw0.$}>
        {canScrollLeft && (
          <div
            css={Css.absolute.left0.top0.bottom0.wPx(16).z1.add("pointerEvents", "none").$}
            style={{ background: leftFade }}
          />
        )}
        {/* py/my: oxa also clips overflow-y, so pad for the 4px bshFocus ring without growing layout */}
        <div
          ref={stripRef}
          css={Css.df.gap1.oxa.fs0.sbwn.pyPx(4).myPx(-4).element("::-webkit-scrollbar").dn.$}
          {...tid.items}
        >
          {thumbnails.map((item) => (
            <Thumbnail key={item.id} item={item} tid={tid} />
          ))}
        </div>
        {canScrollRight && (
          <div
            css={Css.absolute.right0.top0.bottom0.wPx(16).z1.add("pointerEvents", "none").$}
            style={{ background: rightFade }}
          />
        )}
      </div>
      <div css={Css.fs0.df.aic.jcc.hPx(32).$}>
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByDir(1)}
            css={
              Css.bn.bgTransparent.p0.df.aic.jcc.cursorPointer.color(Tokens.OnSurface).outline(0).onFocusVisible
                .bshFocus.$
            }
            {...tid.next}
          >
            <Icon icon="chevronRight" inc={3} color={Tokens.OnSurface} />
          </button>
        )}
      </div>
    </div>
  );
}

type ThumbnailProps = {
  item: CardCarouselThumbnail;
  tid: ReturnType<typeof useTestIds>;
};

function Thumbnail(props: ThumbnailProps) {
  const { item, tid } = props;
  const { hoverProps, isHovered } = useHover({});
  const { pressProps, isPressed } = usePress({});
  const { focusProps, isFocusVisible } = useFocusRing();
  // Opaque swatches cover the link bg, so hover/press use a tint overlay on top of the image.
  const showHoverFill = isHovered && !isPressed;
  return (
    <Tooltip title={item.label} placement="top">
      <Link
        to={item.to}
        aria-label={item.label}
        className={navLink}
        {...mergeProps(hoverProps, pressProps, focusProps, tid.item)}
        css={{
          ...Css.relative.db.fs0.hPx(32).wPx(32).br8.ba.bcGray300.bgWhite.outline(0).$,
          ...(showHoverFill ? Css.bgGray100.$ : {}),
          ...(isPressed ? Css.bgBlue50.bcBlue600.$ : {}),
          ...(isFocusVisible ? Css.bshFocus.$ : {}),
        }}
      >
        <span css={Css.db.w100.h100.oh.br8.$}>
          <img css={Css.w100.h100.objectFit("cover").db.$} src={item.swatchUrl} alt="" loading="lazy" />
        </span>
        {showHoverFill && (
          <span
            aria-hidden
            css={Css.absolute.top0.left0.w100.h100.br8.bgGray900.o(0.12).add("pointerEvents", "none").$}
          />
        )}
        {isPressed && (
          <span
            aria-hidden
            css={Css.absolute.top0.left0.w100.h100.br8.bgBlue600.o(0.28).add("pointerEvents", "none").$}
          />
        )}
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

/** Covers the whole card so the row's action stays clickable; the carousel opts out of it via `z1`. */
const stretchedAction = Css.absolute.top0.left0.w100.h100.br12.bn.bgTransparent.p0.cursorPointer.outline(0).$;

const leftFade = `linear-gradient(90deg, var(${Tokens.SurfaceRaised}) 0%, transparent 100%)`;
const rightFade = `linear-gradient(270deg, var(${Tokens.SurfaceRaised}) 0%, transparent 100%)`;
