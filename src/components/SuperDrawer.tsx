import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useCallback } from "react";
import { Css, px } from "src";
import { Button, ButtonProps } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { IconButton } from "./IconButton";
import { SuperDrawerNewOpenInDrawerProps, useSuperDrawer } from "./SuperDrawerContext";

/** Right side drawer component */
export function SuperDrawer() {
  const { contentStack, modalContent, closeDrawer } = useSuperDrawer();

  // Get the latest element on the stack
  const { title, content, mode, ...other } = contentStack[contentStack.length - 1] ?? {};
  // Narrowing the union in a sense
  const { onPrevClick, onNextClick, onClose } = other as SuperDrawerNewOpenInDrawerProps;

  function handleOnClose() {
    if (onClose) return onClose();
    return closeDrawer();
  }

  return (
    <AnimatePresence>
      {content && (
        // Overlay
        <motion.div
          // Key is required for framer-motion animations
          key="superDrawer"
          // TODO: Should this color be part of the Palette?
          css={Css.fixed.df.justifyEnd.add("backgroundColor", "rgba(36,36,36,0.2)").add("inset", 0).$}
          // Initial styles (acts similar to `from` in keyframe animations)
          initial={{ opacity: 0 }}
          // Rendered styles (acts similar to `to` in keyframe animations)
          animate={{ opacity: 1 }}
          // Unmount styles
          exit={{ opacity: 0, transition: { delay: 0.2 } }}
          onClick={handleOnClose}
        >
          {/* Content container */}
          <motion.div
            key="superDrawerContainer"
            css={Css.bgWhite.h100.maxw(px(1040)).w100.df.flexColumn.$}
            // Keeping initial x to 1040 as this will still work if the container is smaller
            initial={{ x: 1040 }}
            animate={{ x: 0 }}
            // Custom transitions settings for the translateX animation
            transition={{ ease: "linear", duration: 0.2, delay: 0.2 }}
            exit={{ transition: { ease: "linear", duration: 0.2 }, x: 1040 }}
            // Preventing clicks from triggering parent onClick
            onClick={(e) => e.stopPropagation()}
          >
            <header css={Css.df.p3.bb.bGray200.df.itemsCenter.justifyBetween.$}>
              {/* Left */}
              <div css={Css.xl2Em.gray900.$}>{title}</div>
              {/* Right */}
              {!modalContent && (
                // Forcing height to 32px to match title height
                <div css={Css.df.childGap3.itemsCenter.hPx(32).$}>
                  {/* Disable buttons is handlers are not given or if childContent is shown */}
                  <ButtonGroup
                    buttons={[
                      {
                        icon: "chevronLeft",
                        onClick: () => onPrevClick && onPrevClick(),
                        disabled: !onPrevClick || mode === "detail",
                      },
                      {
                        icon: "chevronRight",
                        onClick: () => onNextClick && onNextClick(),
                        disabled: !onNextClick || mode === "detail",
                      },
                    ]}
                  />
                  <IconButton icon="x" onClick={handleOnClose} />
                </div>
              )}
            </header>
            {modalContent ? (
              // Forcing some design constraints on the modal component
              <div css={Css.bgWhite.df.itemsCenter.justifyCenter.fg1.flexColumn.$}>{modalContent}</div>
            ) : (
              content
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SuperDrawerContentProps {
  children: ReactNode;
  /**
   * Actions represents an array of button props with represents that different
   * actions that can be conducted in the SuperDrawer page.
   *
   * Ex: A `cancel` and `submit` button
   * */
  actions: ButtonProps[];
}

/**
 * Helper component to place the given children and actions into the appropriate
 * DOM format to render inside the SuperDrawer.
 *
 * NOTE: This does not include the header props since the caller will be the one
 * that knows how to handle the title, prev/next link and the onClose handler.
 */
export const SuperDrawerContent = ({ children, actions }: SuperDrawerContentProps) => {
  const { contentStack, closeInDrawer } = useSuperDrawer();

  // Determine if the current element is a new content element or an detail element
  const { mode } = contentStack[contentStack.length - 1] ?? {};

  const ContentWrapper = useCallback(
    ({ children }: { children: ReactNode }) =>
      mode === "new" ? (
        <motion.div key="content" css={Css.p3.fg1.$} style={{ overflow: "auto" }}>
          {children}
        </motion.div>
      ) : (
        <motion.div
          css={Css.px3.pt2.pb3.fg1.$}
          animate={{ overflow: "auto" }}
          transition={{ overflow: { delay: 0.3 } }}
        >
          <Button label="Back" icon="chevronLeft" variant="tertiary" onClick={() => closeInDrawer()} />
          <motion.div
            initial={{ x: 1040, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              ease: "linear",
              duration: 0.3,
              opacity: {
                delay: 0.15,
              },
            }}
            exit={{ x: 1040, opacity: 0 }}
            css={Css.pt2.$}
          >
            {children}
          </motion.div>
        </motion.div>
      ),
    [mode, closeInDrawer],
  );

  return (
    <>
      <ContentWrapper>{children}</ContentWrapper>
      {/* Render footer section with row of given footer buttons */}
      <footer css={Css.bt.bGray200.p3.df.itemsCenter.justifyEnd.$}>
        <div css={Css.df.childGap1.$}>
          {actions.map((buttonProps, i) => (
            <Button key={i} {...buttonProps} />
          ))}
        </div>
      </footer>
    </>
  );
};
