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
      <>
        {content.map(({ icon }) => (
          <div key={icon} css={Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.aic.mb2.$}>
            <IconButton onClick={() => setSelectedIcon(icon)} icon={icon} inc={3.5} />
          </div>
        ))}
      </>
    );

  return (
    <div css={Css.dg.gtc("3fr 1fr").gtr("auto").gap1.maxh("calc(100vh - 150px)").oa.$}>
      {content.find((sidebar) => sidebar.icon === selectedIcon)?.render()}
      <div css={Css.br100.wPx(50).hPx(50).bcGray300.ba.df.jcc.aic.$}>
        <IconButton onClick={() => setSelectedIcon(undefined)} icon="x" inc={3.5} />
      </div>
    </div>
  );
}
