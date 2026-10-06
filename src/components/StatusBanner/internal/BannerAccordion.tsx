import { useId } from "@react-aria/utils";
import { useFocusRing } from "react-aria";
import { BannerItem } from "src/components/StatusBanner/internal/BannerItem";
import { BannerRow } from "src/components/StatusBanner/internal/BannerRow";
import { bannerTypeStyles } from "src/components/StatusBanner/internal/bannerTypeStyles";
import type { BannerItemProps, PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { Css, Tokens } from "src/Css";
import { ExpandChevron, expandCollapsePanelStyles, useExpandCollapse } from "src/hooks/useExpandCollapse";
import { useTestIds } from "src/utils/useTestIds";

type BannerAccordionProps = PageBannerProps & {
  items: BannerItemProps[];
  defaultExpanded?: boolean;
};

/** Inline banner whose chevron reveals `items`. Rendered by `Banner` when it has items. */
export function BannerAccordion(props: BannerAccordionProps) {
  const { items, defaultExpanded = false, ...bannerProps } = props;
  const tid = useTestIds(props, "banner");
  const { expanded, toggle, contentRef, contentHeight } = useExpandCollapse({ defaultExpanded });
  const { isFocusVisible, focusProps } = useFocusRing();
  const detailsId = useId();
  const { background, border } = bannerTypeStyles[props.type];

  return (
    <div
      css={{
        ...border,
        ...background,
        ...Css.w100.oh.br12.$,
      }}
      role="status"
      {...tid}
    >
      <div css={{ ...Css.p2.$, ...(expanded && { ...background, ...Css.bb.bc(Tokens.SurfaceSeparator).$ }) }}>
        <BannerRow
          {...bannerProps}
          {...tid}
          accordionToggle={
            <button
              {...focusProps}
              type="button"
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={expanded ? "Hide details" : "Show details"}
              onClick={toggle}
              css={{ ...Css.df.aic.br4.cursorPointer.$, ...(isFocusVisible && Css.bshFocus.$) }}
              {...tid.toggle}
            >
              <ExpandChevron expanded={expanded} />
            </button>
          }
        />
      </div>
      <div
        id={detailsId}
        aria-hidden={!expanded}
        inert={expanded ? undefined : true}
        css={expandCollapsePanelStyles(contentHeight)}
        {...tid.details}
      >
        <div ref={contentRef}>
          {items.map((item, i) => (
            <BannerItem key={item.title} {...item} isLast={i === items.length - 1} {...tid.item} />
          ))}
        </div>
      </div>
    </div>
  );
}
