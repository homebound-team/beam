import { ReactNode } from "react";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export interface PageHeaderProps {
  title: ReactNode;
  rightSlot?: ReactNode;
}

export function PageHeader(props: PageHeaderProps) {
  const { title, rightSlot, ...otherProps } = props;
  const tid = useTestIds(otherProps, "pageHeader");

  return (
    <header {...tid} css={Css.df.fdc.pt3.pr3.pl3.bb.bc(Tokens.SurfaceSeparator).$}>
      <div css={Css.df.jcsb.mb2.w100.gap1.$}>
        <div>
          {/* Breadcrumbs here */}
          <h1 {...tid.title} css={Css.xl.$}>
            {title}
          </h1>
        </div>
        <div>{rightSlot}</div>
      </div>
      {/* Tabs Here */}
    </header>
  );
}
