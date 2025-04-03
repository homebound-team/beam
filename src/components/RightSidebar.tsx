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

export function RightSidebar({ content }: RightSidebarProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconKey | undefined>(undefined);
  const tid = useTestIds({}, "rightSidebar");

  return (
    <>
      <div css={Css.df.jcfe.relative.pr3.$}>
        <div css={Css.df.gap2.z1.$}>
          {content.map(({ icon }) => (
            <IconButton
              key={`${icon}-${selectedIcon}`}
              circle
              active={icon === selectedIcon}
              onClick={() => setSelectedIcon(icon)}
              icon={icon}
              inc={3.5}
            />
          ))}
        </div>
      </div>
      <div
        css={{
          ...Css.wPx(selectedIcon ? 380 : 0).relative.topPx(-48).z0.$,
          transition: selectedIcon ? "transform 300ms ease-in" : "transform 300ms ease-out",
          transform: selectedIcon ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {selectedIcon && (
          <>
            <div css={Css.absolute.leftPx(-24).top0.$}>
              <IconButton circle onClick={() => setSelectedIcon(undefined)} icon="x" inc={3.5} />
              {/* vertical line */}
              <div css={Css.absolute.topPx(48).leftPx(23).h("calc(100vh - 168px)").wPx(1).bgGray300.$} />
            </div>
            <div css={Css.ptPx(78).px3.$} {...tid.content}>
              {content.find((sidebar) => sidebar.icon === selectedIcon)?.render()}
            </div>
          </>
        )}
      </div>
    </>
  );
}
