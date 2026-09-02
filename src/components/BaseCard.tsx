import { ReactNode } from "react";
import { useFocusRing } from "react-aria";
import { ButtonMenu, ButtonMenuProps } from "src/components/ButtonMenu";
import { CardTag, ImageFitType } from "src/components/Card";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Tag } from "src/components/Tag";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";

export type BaseCardProps = {
  /** Hero image url.  */
  imgSrc: string;
  /** Doubles as the link/button's accessible name when set.*/
  imgAlt?: string;
  /** Defaults to `"cover"`. */
  imageFit?: ImageFitType;
  /** Status tag overlaying the hero's leading edge. */
  tag?: CardTag;
  /** Button or menu overlaying the hero's trailing edge. */
  action?: IconButtonProps | ButtonMenuProps;
  /** Card body. Unpadded to allow callers to full-bleed sections; the standard inset is usally `p3`. */
  children: ReactNode;
  /** Content with its own interactive controls, rendered outside the card's link/button area. */
  footer?: ReactNode;
  /** Makes the body a link. Takes precedence over `onClick`. */
  to?: string;
  /** Makes the body a button, for cards that act on click instead of navigating. */
  onClick?: () => void;
  /** Fixed card height in px. Defaults to sizing to content. */
  height?: number;
  /** Adds ai styling. */
  aiMode?: boolean;
};

/** The shared card shell: border, radius, hero image, and interaction states. Callers own the body. */
export function BaseCard(props: BaseCardProps) {
  const {
    imgSrc,
    imgAlt = "",
    imageFit = "cover",
    tag,
    action,
    children,
    footer,
    to,
    onClick,
    height,
    aiMode = false,
  } = props;
  const tid = useTestIds(props, "baseCard");
  const { isFocusVisible, focusProps } = useFocusRing();
  const cardAction = to || onClick;

  const actionAttrs = {
    ...tid.action,
    // Without this, an interactive card with a decorative hero (`imgAlt` unset) still gets a correct
    // accessible name — the browser computes it from the link/button's own text content.
    ...(imgAlt ? { "aria-label": imgAlt } : {}),
    // `getButtonOrLink` renders its `<button>` without a type, which would default to submit inside a form.
    type: typeof cardAction === "string" ? undefined : "button",
    ...Css.props(contentStyles),
    ...focusProps,
  };

  const content = (
    <>
      <div
        css={
          Css.relative
            .hPx(heroHeight)
            .w100.bb.oh.borderRadius("12px 12px 0 0")
            .if(aiMode)
            .bc(Tokens.AiFieldBg)
            .else.bc(Tokens.FieldBorderDefault).$
        }
        {...tid.hero}
      >
        <img css={Css.h100.w100.objectFit(imageFit).$} src={imgSrc} alt={imgAlt} loading="lazy" {...tid.image} />
        {/* `Tag` isn't focusable, so it can nest inside the card's own link. */}
        {tag && (
          <div css={Css.absolute.top1.left1.df.$} {...tid.tag}>
            <Tag {...tag} />
          </div>
        )}
      </div>
      {children}
    </>
  );

  return (
    <div
      css={{
        ...Css.w100.df.fdc.relative.ba.br12
          .bc(Tokens.FieldBorderDefault)
          .if(aiMode)
          .bgColor(Tokens.AiFieldBg)
          .else.bgColor(Tokens.SurfaceRaised).$,
        ...(height !== undefined ? Css.hPx(height).$ : {}),
        ...(cardAction ? Css.cursorPointer.onHover.bshHover.$ : {}),
        ...(isFocusVisible ? Css.bshFocus.ba.$ : {}),
        // Must follow the focus ring, whose `ba` would reset the AI border back to 1px.
        ...(aiMode ? Css.bw2.bc(Tokens.AiFieldFg).$ : {}),
      }}
      {...tid}
    >
      {cardAction ? (
        getButtonOrLink(content, cardAction, actionAttrs)
      ) : (
        // Keep the same box as the action, so the card's layout doesn't depend on it being interactive.
        <div css={contentStyles}>{content}</div>
      )}
      {/* Siblings of the card's link — a button can't nest inside an anchor. They still land over the
          hero because this box is `relative` and the hero is a fixed height at the top. */}
      {action && (
        <div css={Css.absolute.top2.right2.$} {...tid.heroAction}>
          {"items" in action ? <ButtonMenu {...action} /> : <IconButton {...action} />}
        </div>
      )}
      {footer && <div {...tid.footer}>{footer}</div>}
    </div>
  );
}

const heroHeight = 184;
/**
 * The box holding the hero and body, i.e. the card's link/button, or a plain div for a static card.
 * Deliberately carries no padding or gap — those differ per card type, so callers own them.
 */
const contentStyles = Css.df.fdc.fg1.mw0.w100.tal.bn.p0.bgTransparent.color("unset").tdn.outline(0).$;
