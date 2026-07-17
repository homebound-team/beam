import { ReactNode, useMemo } from "react";
import { useHover } from "react-aria";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";
import { ButtonMenu, MenuItem } from "./ButtonMenu";
import { Tag, TagType } from "./Tag";

export type CardType = "card" | "list";
export type ImageFitType = "contain" | "cover";
export type CardTag = {
  text: string;
  type?: TagType;
};

export type CardProps = {
  title: string;
  subtitle: string;
  detailContent?: ReactNode;
  imgSrc: string;
  // contain displays entire image, cover fills the space
  imageFit?: ImageFitType;
  type?: CardType;
  bordered?: boolean;
  disabled?: boolean;
  buttonMenuItems?: MenuItem[];
  tag?: CardTag;
};

export function Card(props: CardProps) {
  const {
    title,
    subtitle,
    detailContent,
    imgSrc,
    imageFit = "contain",
    type = "card",
    bordered = false,
    disabled: isDisabled = false,
    buttonMenuItems,
    tag,
  } = props;
  const tid = useTestIds(props, "card");
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const isList = type === "list";
  const imgHeight = isList ? 96 : bordered ? 224 : 256;

  const styles = useMemo(
    () => ({
      ...baseStyles(type),
      ...(isList && listStyles),
      ...(bordered && borderedStyles),
      ...(isHovered && cardHoverStyles),
      ...(isDisabled && disabledStyles),
    }),
    [isDisabled, isHovered, bordered, type, isList],
  );

  return (
    <div css={styles} {...hoverProps} {...tid}>
      {/* Image */}
      <div
        css={{
          ...Css.hPx(imgHeight)
            .ba.br8.bc(Tokens.FieldBorderDefault)
            .oh.df.asc.jsc.relative.add("filter", "brightness(1)").$,
          ...(isHovered && !isList && imageHoverStyles),
        }}
      >
        <img css={Css.w100.h100.objectFit(imageFit).$} src={imgSrc} alt={title} {...tid.img} />
      </div>
      {/* Vertical Dots Button Menu */}
      {isHovered && buttonMenuItems && (
        <div css={Css.absolute.right1.top1.if(bordered && !isList).right3.top3.$}>
          <ButtonMenu
            trigger={{ icon: "verticalDots", color: isList ? Tokens.OnSurfaceMuted : Tokens.OnPrimary }}
            items={buttonMenuItems}
          />
        </div>
      )}
      {/* Tag */}
      {tag && (
        <div css={Css.absolute.left1.topPx(4).$}>
          <Tag type={tag?.type} text={tag?.text} {...tid.tag} />
        </div>
      )}
      {/* Titles and detailContent */}
      <div css={Css.df.fdc.aifs.gap1.$}>
        <div>
          <div css={Css.xsSb.color(Tokens.OnSurfaceMuted).$} {...tid.subtitle}>
            {subtitle}
          </div>
          <div css={Css.smSb.color(Tokens.OnSurface).if(isHovered).color(Tokens.TextLinkDefault).$} {...tid.title}>
            {title}
          </div>
        </div>
        <div {...tid.details}>{detailContent}</div>
      </div>
    </div>
  );
}

const width = { card: 256, list: 520 };
const baseStyles = (type: CardType) => Css.wPx(width[type]).bgColor(Tokens.Surface).df.fdc.gap1.relative.$;
const listStyles = Css.df.fdr.gap2.$;
const borderedStyles = Css.ba.br8.bc(Tokens.FieldBorderDefault).p2.$;
const disabledStyles = Css.add("opacity", 0.5).add("transition", "opacity 0.3s ease").$;
const cardHoverStyles = Css.bc(Tokens.FieldBorderHover).cursorPointer.$;
const imageHoverStyles = Css.bgColor(Tokens.Surface)
  .add("filter", "brightness(0.3)")
  .add("transition", "filter 0.3s ease").$;
