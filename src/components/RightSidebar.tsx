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
};

export function RightSidebar({ content }: RightSidebarProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconKey | undefined>(undefined);
  const tid = useTestIds({}, "rightSidebar");
  const width = 380;

  return (
    <>
      <AnimatePresence>
        {selectedIcon === undefined && (
          // Display the icons vertically
          <motion.div
            key="iconsWithoutSidebar"
            animate={{ transition: { delay: 0.2, opacity: 1 } }}
            exit={{ opacity: 0 }}
            css={Css.df.absolute.right0.pr3.$}
            transition={{ ease: "linear", duration: 0.2 }}
          >
            <div css={Css.dg.gap2.z1.$}>
              {content.map(({ icon }) => (
                <IconButton
                  key={icon}
                  circle
                  active={icon === selectedIcon}
                  onClick={() => setSelectedIcon(icon)}
                  icon={icon}
                  inc={3.5}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedIcon && (
          <motion.div
            key="rightSidebar"
            initial={{ x: width, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, ease: "linear", duration: 0.2 }}
            exit={{ transition: { ease: "linear", duration: 0.2 }, x: width }}
            css={Css.wPx(width).bl.bw1.bcGray300.absolute.z0.$}
          >
            <div css={Css.px3.$} {...tid.content}>
              <div css={Css.absolute.leftPx(-24).$}>
                <IconButton
                  bgColor={Palette.White}
                  circle
                  onClick={() => setSelectedIcon(undefined)}
                  icon="x"
                  inc={3.5}
                />
              </div>
              <div css={Css.df.jcfe.gap2.pb3.z1.$}>
                {content.map(({ icon }) => (
                  <IconButton
                    // selectedIcon is added to key to reset the active state
                    key={`${icon}-${selectedIcon}`}
                    circle
                    active={icon === selectedIcon}
                    onClick={() => setSelectedIcon(icon)}
                    icon={icon}
                    inc={3.5}
                  />
                ))}
              </div>
              {content.find((sidebar) => sidebar.icon === selectedIcon)?.render()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
