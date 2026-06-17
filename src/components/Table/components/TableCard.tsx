import { AriaProgressBarProps } from "react-aria";
import { Tag, TagProps } from "src/components";
import { Css, Tokens } from "src/Css";

export type CardData = {
  header: string;
  value: string;
};

// TODO: handle generic typing
export type TableCardProps = {
  imgSrc: string;
  eyebrow?: string;
  title: string;
  badge?: string;
  data: CardData[];
  status?: TagProps<any>;
  progress?: AriaProgressBarProps;
};

export const TableCard = (props: TableCardProps) => {
  const { title, imgSrc, eyebrow, badge, data, status, progress } = props;

  const imageElement = <img css={Css.w("100%").objectFit("contain").$} src={imgSrc} alt={title} />;

  const titleElement = (
    <h4 css={Css.md.fwb.$}>
      {title} {badge && <span css={Css.sm.$}>{badge}</span>}
    </h4>
  );

  const dataElement = (
    <div css={Css.dg.gtc("1fr 1fr").$}>
      {data.map((d, idx) => (
        <p key={`${d.header}-${d.value}`} css={Css.gc((idx % 2) + 1).$}>{`${d.header}: ${d.value}`}</p>
      ))}
    </div>
  );

  return (
    <div css={Css.p3.w("396px").bshBasic.bgColor(Tokens.Surface).$}>
      {status && <Tag {...status} />}
      {imgSrc && imageElement}
      {eyebrow && <p css={Css.sm.$}>{eyebrow}</p>}
      {title && titleElement}
      {data && data?.length > 0 && dataElement}
      {progress && <p>Progress here</p>}
    </div>
  );
};
