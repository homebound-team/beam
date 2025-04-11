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
  metadata: ReactNode;
  image: string;
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
    metadata,
    image,
    imageFit = "contain",
    type = "card",
    bordered = false,
    disabled: isDisabled = false,
    buttonMenuItems,
    tag,
  } = props;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const isList = type === "list";
  const imageSize = isList ? 96 : bordered ? 224 : 256;

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
      <div css={Css.wPx(imageSize).hPx(imageSize).ba.br8.bcGray300.overflow("hidden").df.asc.jsc.relative.$}>
        {/* Dark image overlay on hover */}
        <div
          css={{
            ...Css.absolute.top0.left0.w100.h100.add("opacity", 0).$,
            ...(isHovered && !isList && imageHoverStyles),
          }}
        />
        <img css={Css.w100.h100.objectFit(imageFit).$} src={image} alt={title} />
      </div>
      {isHovered && buttonMenuItems && (
        <div css={Css.absolute.right1.top1.if(bordered && !isList).right3.top3.$}>
          <ButtonMenu
            trigger={{ icon: "verticalDots", color: isList ? Palette.Gray700 : Palette.White }}
            items={buttonMenuItems}
          />
        </div>
      )}
      {tag && (
        <div css={Css.absolute.left1.top1.$}>
          <Tag type={tag?.type} text={tag?.text} />
        </div>
      )}
      <div css={Css.df.fdc.aifs.gap1.$}>
        <div>
          <div css={Css.xsMd.gray700.$}>{subtitle}</div>
          <div css={Css.smMd.gray900.if(isHovered).blue700.$}>{title}</div>
        </div>
        {metadata}
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
const imageHoverStyles = Css.bgGray900.add("opacity", 0.7).add("transition", "opacity 0.3s ease").$;
