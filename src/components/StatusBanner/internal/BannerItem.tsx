import { BannerActions } from "src/components/StatusBanner/internal/BannerActions";
import type { BannerItemProps } from "src/components/StatusBanner/StatusBanner";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

/** One detail row inside an expanded banner. */
export function BannerItem(props: BannerItemProps & { isLast: boolean }) {
  const { title, description, actions = [], isLast } = props;
  const tid = useTestIds(props, "item");
  return (
    // Indents past the header's icon so row copy lines up with the banner title.
    <div
      css={{
        ...Css.df.aic.gapPx(12).fww.bgColor(Tokens.Surface).if(!isLast).bb.bc(Tokens.SurfaceSeparator).$,
        // Indents row content on med and up screens to align with the parent banner's title and actions.
        ...Css.pPx(12).ifMdAndUp.px6.$,
      }}
      {...tid}
    >
      <div css={Css.df.fdc.gapPx(4).fg1.fb(0).mwPx(240).gray900.ifSm.mw0.$}>
        <span css={Css.smSb.$} {...tid.title}>
          {title}
        </span>
        {description && (
          <span css={Css.xs.$} {...tid.description}>
            {description}
          </span>
        )}
      </div>
      {actions.length > 0 && <BannerActions actions={actions.map((action) => ({ action, variant: "secondary" }))} />}
    </div>
  );
}
