import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Tooltip } from "src/components";
import { BaseCard } from "src/components/BaseCard";
import { CardTag, ImageFitType } from "src/components/Card";
import { CardBody, CardData } from "src/components/CardBody";
import { Carousel } from "src/components/Carousel";
import { ProposedValueProps } from "src/components/ProposedValue";
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
import { Css } from "src/Css";
import { navLink } from "src/css/CssReset";
import { useTestIds } from "src/utils";

export type TableCardProps<R extends Kinded> = {
  rs: RowState<R>;
  columns: GridColumnWithId<R>[];
  rowStyle: RowStyle<any> | undefined;
  api: GridTableApi<R>;
  /** Defaults to 430. */
  height?: number;
  /** Defaults to `"cover"`. */
  imageFit?: ImageFitType;
};

function TableCardImpl<R extends Kinded>(props: TableCardProps<R>) {
  const { rs, columns, rowStyle, api, height, imageFit } = props;
  const tid = useTestIds(props, "tableCard");

  let title: string | ProposedValueProps | undefined;
  let leftEyebrow: string | ProposedValueProps | undefined;
  let rightEyebrow: string | ProposedValueProps | undefined;
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
      aiMode={rs.aiMode}
    />
  );
}

export const TableCard = observer(TableCardImpl) as typeof TableCardImpl;

export type TableCardViewProps = {
  imgSrc: string;
  leftEyebrow?: string | ProposedValueProps;
  rightEyebrow?: string | ProposedValueProps;
  title: string | ProposedValueProps;
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
  height?: number;
  /** Defaults to `"cover"`. */
  imageFit?: ImageFitType;
  /** Adds ai styling. */
  aiMode?: boolean;
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
    aiMode = false,
  } = props;
  const tid = useTestIds(props, "tableCardView");
  // `alt` needs plain text even when `title` is a proposal.
  const titleText = typeof title === "string" ? title : title.proposed;
  const shownFooter = shownInteractiveFooter(interactiveFooter);
  // `BaseCard` takes a single `onClick`; a row is either a link or an in-page action, never both.
  const action = to || onClick;

  return (
    <BaseCard
      {...tid}
      imgSrc={imgSrc}
      imgAlt={titleText}
      imageFit={imageFit}
      tag={status}
      onClick={action}
      height={height}
      aiMode={aiMode}
      footer={
        shownFooter && (
          <div css={Css.df.fdc.gap2.px3.pb3.pt2.$} {...tid.interactiveFooter}>
            <InteractiveFooter footer={shownFooter} tid={tid} />
          </div>
        )
      }
    >
      <CardBody
        {...tid}
        title={title}
        leftEyebrow={leftEyebrow}
        rightEyebrow={rightEyebrow}
        badge={badge}
        badgeTags={badgeTags}
        data={data}
        progress={progress}
        aiMode={aiMode}
        hasFooter={!!shownFooter}
      />
    </BaseCard>
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
