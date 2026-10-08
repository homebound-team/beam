import type { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { isDefined } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type EntityLockupProps = {
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
      <div css={styles.body}>
        <div css={styles.text}>
          <div css={styles.title} {...tid.title}>
            {title}
          </div>
          {isDefined(description) && (
            <div
              css={{ ...styles.description, ...(typeof description === "string" ? styles.clamp : {}) }}
              {...tid.description}
            >
              {description}
            </div>
          )}
        </div>
        {isDefined(right) && (
          <div css={styles.right} {...tid.right}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

const defaultStyles = {
  container: Css.df.aifs.gap2.$,
  image: Css.fs0.sqPx(96).br8.ba.bc(Tokens.FieldBorderDefault).oh.bgWhite.$,
  // On small screens, `right` moves under the description so the text keeps its width.
  body: Css.df.fg1.mw0.gap2.ifSm.fdc.gap1.$,
  text: Css.df.fdc.mw0.fg1.gap1.$,
  title: Css.smSb.color(Tokens.OnSurface).lineClamp2.$,
  description: Css.xs.color(Tokens.OnSurface).$,
  clamp: Css.lineClamp2.$,
  // Capped at half the row so wide content can't squeeze the text to nothing; on small screens it gets its own row.
  // A lone child (fewer than two elements) stays right-aligned instead of falling to the start under `jcsb`.
  right: Css.fs0
    .maxw("50%")
    .df.fdc.aife.gapPx(6)
    .asfs.tar.ifSm.maxw("none")
    .fdr.aic.jcsb.asStretch.when(":not(:has(> :nth-child(2)))").jcfe.$,
};

const compactStyles = {
  container: Css.df.aic.gapPx(12).$,
  image: Css.fs0.sqPx(62).br8.ba.bc(Tokens.SurfaceSeparator).oh.bgWhite.$,
  // Stretches to the image's height so `right` stays top-aligned while the text is centered.
  body: Css.df.fg1.mw0.gapPx(12).asStretch.$,
  text: Css.df.fdc.mw0.fg1.gapPx(2).asc.$,
  title: Css.xsSb.color(Tokens.OnSurface).lineClamp1.$,
  description: Css.xs2.color(Tokens.OnSurface).$,
  clamp: Css.truncate.$,
  right: Css.fs0.maxw("50%").df.fdc.aife.gapPx(6).asfs.tar.$,
};
