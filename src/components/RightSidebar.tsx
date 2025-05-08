import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";
import { IconKey } from "./Icon";
import { IconButton } from "./IconButton";

export type SidebarContentProps = {
  icon: IconKey;
  render: () => ReactNode;
};

export type RightSidebarProps = {
  content: SidebarContentProps[];
  headerHeightPx: number;
};

/** Exporting this value allows layout components to coordinate responsive column sizing
 * while avoiding layout shift when the sidebar is opened */
export const RIGHT_SIDEBAR_MIN_WIDTH = "250px";

export function RightSidebar({ content, headerHeightPx }: RightSidebarProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconKey | undefined>(undefined);
  const tid = useTestIds({}, "rightSidebar");

  return (
    <>
      {/* Vertical icons when closed, positioned absolutely to avoid layout shift when the sidebar is opened */}
      <div css={Css.df.jcfe.absolute.right0.pr3.$}>
        <AnimatePresence>
          {!selectedIcon && (
            <motion.div
              css={Css.df.fdc.gap2.z1.$}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ ease: [0.51, 0.92, 0.24, 1], duration: 0.3, delay: 0.2 }}
            >
              <IconButtonList content={content} selectedIcon={selectedIcon} onIconClick={setSelectedIcon} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {selectedIcon && (
          <motion.div
            key="rightSidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, ease: [0.51, 0.92, 0.24, 1], duration: 0.3 }}
            exit={{ transition: { ease: "linear", duration: 0.2 }, x: "100%" }}
            css={Css.w100.mw(RIGHT_SIDEBAR_MIN_WIDTH).z0.maxh(`calc(100vh - ${headerHeightPx}px)`).oya.pl4.pr3.$}
          >
            <>
              {/* Sticky header section */}
              <div css={Css.sticky.top0.bgWhite.$}>
                {/* Close button */}
                <div css={Css.absolute.leftPx(-24).top0.df.fdc.aic.$}>
                  <IconButton
                    bgColor={Palette.White}
                    circle
                    onClick={() => setSelectedIcon(undefined)}
                    icon="x"
                    inc={3.5}
                  />
                  {/* vertical line */}
                  <div css={Css.absolute.topPx(48).h("calc(100vh - 168px)").wPx(1).bgGray300.$} />
                </div>
                {/* Horizontal icons when opened */}
                <div css={Css.df.aic.jcfe.gap2.mb3.$}>
                  <IconButtonList content={content} selectedIcon={selectedIcon} onIconClick={setSelectedIcon} />
                </div>
              </div>

              {/* Content area */}
              {selectedIcon && (
                <div {...tid.content} css={Css.pl3.$}>
                  {content.find((sidebar) => sidebar.icon === selectedIcon)?.render()}
                </div>
              )}
            </>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type IconButtonListProps = {
  content: SidebarContentProps[];
  selectedIcon: IconKey | undefined;
  onIconClick: (icon: IconKey) => void;
};

/** Shared component for rendering the list of icon buttons */
function IconButtonList({ content, selectedIcon, onIconClick }: IconButtonListProps) {
  return (
    <>
      {content.map(({ icon }) => (
        <IconButton
          // selectedIcon is added to key to reset the active state
          key={`${icon}-${selectedIcon}`}
          circle
          active={icon === selectedIcon}
          onClick={() => onIconClick(icon)}
          icon={icon}
          inc={3.5}
        />
      ))}
    </>
  );
}
