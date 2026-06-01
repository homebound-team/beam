import { ReactNode } from "react";
import { Css, Margin, Only, Xss } from "src/Css";

type PageHeaderXss = Margin;
export interface PageHeaderProps<X> {
  title: ReactNode;
  rightSlot?: ReactNode;
  xss?: X;
}

export function PageHeader<X extends Only<Xss<PageHeaderXss>, X>>(props: PageHeaderProps<X>) {
  const { title, rightSlot, xss } = props;

  return (
    <header css={{ ...Css.df.fdc.pt3.pr3.pl3.$, ...xss }}>
      <div css={Css.df.jcsb.mb2.w100.aic.$}>
        <div>
          {/* Breadcrumbs here */}
          <h2 css={Css.xl.$}>{title}</h2>
        </div>
        <div>{rightSlot}</div>
      </div>
      {/* Tabs Here */}
    </header>
  );
}
