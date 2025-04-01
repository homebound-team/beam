import { ReactNode, useState } from "react";
import { Css } from "src/Css";
import { IconKey } from "./Icon";
import { IconButton } from "./IconButton";

export type SidebarProps = {
  icon: IconKey;
  render: () => ReactNode;
};

export type RightSidebarProps = {
  content: SidebarProps[];
};

export function RightSidebar(props: RightSidebarProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconKey | undefined>(undefined);
  const { content } = props;

  if (!selectedIcon)
    return (
      <div css={Css.mtPx(92).mr3.gap2.dg.$}>
        {content.map(({ icon }) => (
          <div key={icon} css={Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.jse.aic.$}>
            <IconButton onClick={() => setSelectedIcon(icon)} icon={icon} inc={3.5} />
          </div>
        ))}
      </div>
    );

  return (
    <div css={Css.wPx(380).mr3.$}>
      <div css={Css.df.jcsb.aic.$}>
        <div css={Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.aic.mlPx(-18).$}>
          <IconButton onClick={() => setSelectedIcon(undefined)} icon="x" inc={3.5} />
          <div css={Css.absolute.topPx(50).h("calc(100vh - 50px)").wPx(1).bgGray300.$}></div>
        </div>
        <div css={Css.df.gap2.$}>
          {content.map(({ icon }) => (
            <div
              key={icon}
              css={
                Css.br100
                  .wPx(50)
                  .hPx(50)
                  .bcGray300.ba.df.jcc.jse.aic.if(selectedIcon === icon).bgGray200.$
              }
            >
              <IconButton onClick={() => setSelectedIcon(icon)} icon={icon} inc={3.5} />
            </div>
          ))}
        </div>
      </div>
      <div css={Css.mt3.ml4.$}>{content.find((sidebar) => sidebar.icon === selectedIcon)?.render()}</div>
    </div>
  );
}
