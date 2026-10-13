import type { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { isDefined } from "src/utils/helpers";
import { useTestIds } from "src/utils/useTestIds";

export type EntityLockupProps = {
  /** Thumbnail image URL. */
  imgSrc: string;
  title: string;
  /** Short line above the title, e.g. a brand. */
  eyebrow?: ReactNode;
  /** Secondary content under the title; can include extra rows like a status. */
  description?: ReactNode;
  /** Trailing content aligned to the right, e.g. a Tag and price. */
  right?: ReactNode;
  /** Forces the compact layout at any width, e.g. in sidebars. It applies anyway when the lockup is 400px wide or less. */
  compact?: boolean;
};

/** Image thumbnail beside a title and description, identifying an entity such as a product or option. */
export function EntityLockup(props: EntityLockupProps) {
  const { imgSrc, title, eyebrow, description, right, compact = false } = props;
  const tid = useTestIds(props, "entityLockup");
  const styles = compact ? compactStyles : defaultStyles;
  return (
    // `defaultStyles` query this container's width to switch to compact.
    <div css={Css.w100.mw0.ctis.cn("entityLockup").$} {...tid}>
      <div css={styles.container}>
        <div css={styles.image}>
          <img src={imgSrc} alt={title} loading="lazy" css={Css.w100.h100.objectCover.db.$} {...tid.image} />
        </div>
        <div css={styles.body}>
          <div css={styles.text}>
            <div css={styles.heading}>
              {isDefined(eyebrow) && (
                <div css={styles.eyebrow} {...tid.eyebrow}>
                  {eyebrow}
                </div>
              )}
              <div css={styles.title} {...tid.title}>
                {title}
              </div>
            </div>
            {isDefined(description) && (
              <div css={styles.description} {...tid.description}>
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
    </div>
  );
}

// Matches `compactStyles` when the lockup is 400px wide or less. Truss only accepts literals in `ifContainer`.
const defaultStyles = {
  container: Css.df.aifs.gap2.ifContainer({ name: "entityLockup", lt: 400 }).gapPx(12).$,
  image: Css.fs0
    .sqPx(96)
    .br8.ba.bc(Tokens.FieldBorderDefault)
    .oh.bgColor(Tokens.SurfaceRaised)
    .ifContainer({ name: "entityLockup", lt: 400 })
    .sqPx(62)
    .bc(Tokens.SurfaceSeparator).$,
  body: Css.df.fg1.mw0.gap2.ifContainer({ name: "entityLockup", lt: 400 }).gapPx(12).asStretch.$,
  text: Css.df.fdc.mw0.fg1.gap1.ifContainer({ name: "entityLockup", lt: 400 }).gapPx(2).ptPx(4).$,
  heading: Css.df.fdc.gapPx(2).ifContainer({ name: "entityLockup", lt: 400 }).gap0.$,
  eyebrow: Css.sm.color(Tokens.OnSurface).ifContainer({ name: "entityLockup", lt: 400 }).xs.$,
  title: Css.smSb.color(Tokens.OnSurface).ifContainer({ name: "entityLockup", lt: 400 }).xsSb.$,
  description: Css.xs.color(Tokens.OnSurface).ifContainer({ name: "entityLockup", lt: 400 }).xs2.$,
  // Capped at half the row so wide content can't squeeze the text to nothing.
  right: Css.fs0.maxw("50%").df.fdc.aife.gapPx(6).asfs.tar.$,
};

const compactStyles = {
  container: Css.df.aifs.gapPx(12).$,
  image: Css.fs0.sqPx(62).br8.ba.bc(Tokens.SurfaceSeparator).oh.bgColor(Tokens.SurfaceRaised).$,
  // Stretches to the image's height so the text and `right` both align to the top of the row.
  body: Css.df.fg1.mw0.gapPx(12).asStretch.$,
  text: Css.df.fdc.mw0.fg1.gapPx(2).ptPx(4).$,
  heading: Css.df.fdc.$,
  eyebrow: Css.xs.color(Tokens.OnSurface).$,
  title: Css.xsSb.color(Tokens.OnSurface).$,
  description: Css.xs2.color(Tokens.OnSurface).$,
  right: Css.fs0.maxw("50%").df.fdc.aife.gapPx(6).asfs.tar.$,
};
