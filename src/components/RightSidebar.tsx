import { ReactNode, useState } from "react";
import { Css } from "src/Css";
import { useTestIds } from "src/utils";
import { IconKey } from "./Icon";
import { IconButton } from "./IconButton";

export type SidebarContentProps = {
  icon: IconKey;
  render: () => ReactNode;
};

export type RightSidebarProps = {
  content: SidebarContentProps[];
};

export function RightSidebar(props: RightSidebarProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconKey | undefined>(undefined);
  const { content } = props;
  const tids = useTestIds(props, "rightSidebar");
  const iconCircleStyle = Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.aic.onHover.bgGray200.$;
  const iconCircleSelectedStyle = { ...iconCircleStyle, ...Css.bgGray200.$ };

  if (!selectedIcon)
    // display closed state
    return (
      <div css={Css.dg.mtPx(92).mx3.gap2.$}>
        {content.map(({ icon }) => (
          <div key={icon} css={{ ...iconCircleStyle, ...Css.jse.$ }}>
            <IconButton onClick={() => setSelectedIcon(icon)} icon={icon} inc={3.5} />
          </div>
        ))}
      </div>
    );

  // display open state
  return (
    <div css={Css.maxwPx(380).mr3.$}>
      <div css={Css.df.jcsb.aic.$}>
        <div css={Css.mlPx(-18).$}>
          <div css={iconCircleStyle}>
            <IconButton onClick={() => setSelectedIcon(undefined)} icon="x" inc={3.5} />
          </div>
          {/* vertical line */}
          <div css={Css.absolute.topPx(50).leftPx(6).h("calc(100vh - 50px)").wPx(1).bgGray300.$} />
        </div>
        <div css={Css.df.gap2.$}>
          {content.map(({ icon }) => (
            <div key={icon} css={icon === selectedIcon ? iconCircleSelectedStyle : iconCircleStyle}>
              <IconButton onClick={() => setSelectedIcon(icon)} icon={icon} inc={3.5} />
            </div>
          ))}
        </div>
      </div>
      <div css={Css.mt3.ml4.$} {...tids.content}>
        {content.find((sidebar) => sidebar.icon === selectedIcon)?.render()}
      </div>
    </div>
  );
}
