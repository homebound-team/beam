import { ReactNode, useMemo } from "react";
import { useHover } from "react-aria";
import { Css, Palette } from "src/Css";
import { ButtonMenu, MenuItem } from "./ButtonMenu";
import { Tag, TagType } from "./Tag";

export type TableCardType = "card" | "list";

type CardTag = {
  text: string;
  type?: TagType;
};

export interface TableCardProps {
  title: string;
  subtitle: string;
  detailContent?: ReactNode;
  imgSrc: string;
  // contain displays entire image, cover fills the space
  imageFit?: "contain" | "cover";
  type?: TableCardType;
  bordered?: boolean;
  disabled?: boolean;
  buttonMenuItems?: MenuItem[];
  tag?: CardTag;
}

export function TableCard(props: TableCardProps) {
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
    <div css={styles} {...hoverProps}>
      {/* Image */}
      <div
        css={{
          ...Css.hPx(imgHeight).ba.br8.bcGray300.oh.df.asc.jsc.relative.add("filter", "brightness(1)").$,
          ...(isHovered && !isList && imageHoverStyles),
        }}
      >
        <img css={Css.w100.h100.objectFit(imageFit).$} src={imgSrc} alt={title} />
      </div>
      {/* Vertical Dots Button Menu */}
      {isHovered && buttonMenuItems && (
        <div css={Css.absolute.right1.top1.if(bordered && !isList).right3.top3.$}>
          <ButtonMenu
            trigger={{ icon: "verticalDots", color: isList ? Palette.Gray700 : Palette.White }}
            items={buttonMenuItems}
          />
        </div>
      )}
      {/* Tag */}
      {tag && (
        <div css={Css.absolute.left1.topPx(4).$}>
          <Tag type={tag?.type} text={tag?.text} />
        </div>
      )}
      {/* Titles and detailContent */}
      <div css={Css.df.fdc.aifs.gap1.$}>
        <div>
          <div css={Css.xsMd.gray700.$}>{subtitle}</div>
          <div css={Css.smMd.gray900.if(isHovered).blue700.$}>{title}</div>
        </div>
        {detailContent}
      </div>
    </div>
  );
}

const width = { card: 256, list: 520 };
const baseStyles = (type: TableCardType) => Css.wPx(width[type]).bgWhite.df.fdc.gap1.relative.$;
const listStyles = Css.df.fdr.gap2.$;
const borderedStyles = Css.ba.br8.bcGray300.p2.$;
const disabledStyles = Css.add("opacity", 0.5).add("transition", "opacity 0.3s ease").$;
const cardHoverStyles = Css.bcGray400.cursorPointer.$;
const imageHoverStyles = Css.bgWhite.add("filter", "brightness(0.3)").add("transition", "filter 0.3s ease").$;
