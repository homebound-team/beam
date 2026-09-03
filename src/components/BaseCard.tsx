import { ReactNode } from "react";
import { useFocusRing } from "react-aria";
import { ButtonMenu, ButtonMenuProps } from "src/components/ButtonMenu";
import { CardTag, ImageFitType } from "src/components/Card";
import { IconButton, IconButtonProps } from "src/components/IconButton";
import { Tag } from "src/components/Tag";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { getButtonOrLink } from "src/utils/getInteractiveElement";

// TODO: every card has a hero today, but if a heroless card shows up, consider folding these three
// into a single `heroImg?: { src: string; alt: string; fit?: ImageFitType }`.
export type BaseCardProps = {
  imgSrc: string;
  imgAlt: string;
  /** Defaults to `"cover"`. */
  imageFit?: ImageFitType;
  /** Status tag overlaying the hero's leading edge. */
  tag?: CardTag;
  /** Button or menu overlaying the hero's trailing edge. */
  action?: IconButtonProps | ButtonMenuProps;
  /** Unpadded, so callers can full-bleed sections; the standard inset is usually `p3`. */
  children: ReactNode;
  /** Content with its own interactive controls, rendered outside the card's link/button area. */
  footer?: ReactNode;
  /** A URL makes the body a link; a function makes it a button that acts in place. */
  onClick?: (() => void) | string;
  /** Defaults to sizing to content. */
  height?: number;
  /** Adds ai styling. */
  aiMode?: boolean;
};

/** The shared card shell: border, radius, hero image, and interaction states. Callers own the body. */
export function BaseCard(props: BaseCardProps) {
  const { imgSrc, imgAlt, imageFit = "cover", tag, action, children, footer, onClick, height, aiMode = false } = props;
  const tid = useTestIds(props, "baseCard");
  const { isFocusVisible, focusProps } = useFocusRing();

  const actionAttrs = {
    ...tid.action,
    // `getButtonOrLink` renders its `<button>` without a type, which would default to submit inside a form.
    type: typeof onClick === "string" ? undefined : "button",
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
        <img
          css={Css.h100.w100.objectFit(imageFit).$}
          src={imgSrc}
          alt={imgAlt}
          aria-hidden={imgAlt === "" || undefined}
          loading="lazy"
          {...tid.image}
        />
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
        ...(onClick ? Css.cursorPointer.onHover.bshHover.$ : {}),
        ...(isFocusVisible ? Css.bshFocus.ba.$ : {}),
        // Must follow the focus ring, whose `ba` would reset the AI border back to 1px.
        ...(aiMode ? Css.bw2.bc(Tokens.AiFieldFg).$ : {}),
      }}
      {...tid}
    >
      {onClick ? getButtonOrLink(content, onClick, actionAttrs) : <div css={contentStyles}>{content}</div>}
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
