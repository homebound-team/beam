import { ReactNode } from "react";
import { Margin, Only, Xss } from "src/Css";

type PageHeaderXss = Margin;
export interface PageHeaderProps<X> {
  title: string;
  rightSlot?: ReactNode;
  xss?: X;
}

export function PageHeader<X extends Only<Xss<PageHeaderXss>, X>>(props: PageHeaderProps<X>) {
  const { title, rightSlot } = props;

  return (
    <header>
      <h4>{title}</h4>
      <div>{rightSlot}</div>
    </header>
  );
}
