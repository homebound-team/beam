import type { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type EntityLockupProps = {
  /** Thumbnail image URL. */
  imgSrc: string;
  title: string;
  /** Secondary content under the title; can include extra rows like a status. */
  description?: ReactNode;
  /** Trailing content aligned to the right, e.g. a Tag and price. */
  right?: ReactNode;
  /** Smaller variant for dense lists, e.g. sidebars. */
  compact?: boolean;
};

/** Image thumbnail beside a title and description, identifying an entity such as a product or option. */
export function EntityLockup(props: EntityLockupProps) {
  const { imgSrc, title, description, right, compact = false } = props;
  const tid = useTestIds(props, "entityLockup");
  const styles = compact ? compactStyles : defaultStyles;
  return (
    <div css={styles.container} {...tid}>
      <div css={styles.image}>
        <img src={imgSrc} alt="" loading="lazy" css={Css.w100.h100.objectCover.db.$} {...tid.image} />
      </div>
      <div css={styles.text}>
        <div css={styles.title} {...tid.title}>
          {title}
        </div>
        {description && (
          <div
            css={{ ...styles.description, ...(typeof description === "string" ? styles.clamp : {}) }}
            {...tid.description}
          >
            {description}
          </div>
        )}
      </div>
      {right && (
        <div css={styles.right} {...tid.right}>
          {right}
        </div>
      )}
    </div>
  );
}

const defaultStyles = {
  // On small screens, `right` wraps to its own row under the text, so the text keeps its width.
  container: Css.df.aifs.gap2.ifSm.fww.rg1.$,
  image: Css.fs0.sqPx(96).br8.ba.bcGray300.oh.bgWhite.$,
  // A zero basis keeps the text beside the image instead of wrapping under it.
  text: Css.df.fdc.mw0.fg1.gap1.ifSm.fb(0).$,
  title: Css.smSb.color(Tokens.OnSurface).$,
  description: Css.xs.color(Tokens.OnSurface).$,
  clamp: Css.lineClamp2.$,
  right: Css.fs0.df.fdc.aife.gapPx(6).asfs.tar.ifSm.fb("100%").fdr.aic.jcsb.plPx(112).$,
};

const compactStyles = {
  container: Css.df.aic.gapPx(12).$,
  image: Css.fs0.sqPx(62).br8.ba.bcGray200.oh.bgWhite.$,
  text: Css.df.fdc.mw0.fg1.gapPx(2).$,
  title: Css.xsSb.color(Tokens.OnSurface).$,
  description: Css.xs2.gray800.$,
  clamp: Css.truncate.$,
  right: Css.fs0.df.fdc.aife.gapPx(6).asfs.tar.$,
};
