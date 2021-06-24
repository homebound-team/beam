import { Global } from "@emotion/react";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, ReactPortal, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button, ButtonGroup, ButtonProps, Css, IconButton, px } from "src";
import { useTestIds } from "src/utils";
import { SuperDrawerNewOpenInDrawerProps, useSuperDrawer } from "./index";

/**
 * Global drawer component.
 *
 * The aim of this drawer is to give extra details regarding a page content
 * without the need to change pages.
 *
 * NOTE: Since this component is a global component, meaning there is only one
 * per application shared between all children components of the application, we
 * needed to be strategic in its DOM placement and zIndex. That is why we are
 * using React.createPortal to append this component to the body so that
 * it can be nested at the highest level of the application and share the stacking
 * context with the application and any other global components. Having the
 * application set its zIndex at the body level will guarantee that no children
 * can ever "break out" of the stacking order and overlap global components.
 *
 * TLDR: Long term plan is to have all applications using Beam set their zIndex
 * to 0 and have SuperDrawer zIndex be 3 to give space to place other global
 * components (most likely Modal) between the application and SuperDrawer or
 * above the SuperDrawer.
 */
export function SuperDrawer(): ReactPortal {
  const { contentStack, modalContent, closeDrawer } = useSuperDrawer();
  const testId = useTestIds({}, "superDrawer");

  // Get the latest element on the stack
  const { title, content, type, ...other } = contentStack[contentStack.length - 1] ?? {};
  // Narrowing the union in a sense
  const { onPrevClick, onNextClick, onClose } = other as SuperDrawerNewOpenInDrawerProps;

  function handleOnClose() {
    if (onClose) return onClose();
    return closeDrawer();
  }

  return createPortal(
    <AnimatePresence>
      {content && (
        <>
          {/* Prevent scrolling when the SuperDrawer opens */}
          <Global styles={{ body: Css.overflowHidden.$ }} />
          {/* Overlay */}
          <motion.div
            {...testId}
            // Key is required for framer-motion animations
            key="superDrawer"
            // TODO: Should this color be part of the Palette?
            // z-index of 3 is used to give flexibility for future overlapping content
            // Not using `inset` due to Safari 14.0.x not supporting this CSS property.
            css={Css.fixed.df.justifyEnd.add("backgroundColor", "rgba(36,36,36,0.2)").top0.right0.bottom0.left0.z3.$}
            // Initial styles (acts similar to `from` in keyframe animations)
            initial={{ opacity: 0 }}
            // Rendered styles (acts similar to `to` in keyframe animations)
            animate={{ opacity: 1 }}
            // Unmount styles
            exit={{ opacity: 0, transition: { delay: 0.2 } }}
            onClick={handleOnClose}
          >
            {/* Content container */}
            <motion.aside
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
                <div css={Css.xl2Em.gray900.$} {...testId.title}>
                  {title}
                </div>
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
                          disabled: !onPrevClick || type === "detail",
                          ...testId.prev,
                        },
                        {
                          icon: "chevronRight",
                          onClick: () => onNextClick && onNextClick(),
                          disabled: !onNextClick || type === "detail",
                          ...testId.next,
                        },
                      ]}
                    />
                    <IconButton icon="x" onClick={handleOnClose} {...testId.close} />
                  </div>
                )}
              </header>
              {modalContent ? (
                // Forcing some design constraints on the modal component
                <div css={Css.bgWhite.df.itemsCenter.justifyCenter.fg1.flexColumn.$}>{modalContent}</div>
              ) : (
                content
              )}
            </motion.aside>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
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
  actions?: ButtonProps[];
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
  const { type } = contentStack[contentStack.length - 1] ?? {};

  const ContentWrapper = useCallback(
    ({ children }: { children: ReactNode }) => {
      if (type === "new") {
        return (
          <motion.div key="content" css={Css.p3.fg1.$} style={{ overflow: "auto" }}>
            {children}
          </motion.div>
        );
      } else if (type === "detail") {
        return (
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
                opacity: { delay: 0.15 },
              }}
              exit={{ x: 1040, opacity: 0 }}
              css={Css.pt2.$}
            >
              {children}
            </motion.div>
          </motion.div>
        );
      }

      // Hides content changes when closing the drawer
      // TODO: Potentially use a boolean to trigger close action so content does
      // not need to disappear during exit.
      return <motion.div key="content" css={Css.p3.fg1.$} style={{ overflow: "auto" }}></motion.div>;
    },
    [type, closeInDrawer],
  );

  return (
    <>
      <ContentWrapper>{children}</ContentWrapper>
      {/* Optionally render footer section with row of given footer buttons */}
      {actions && (
        <footer css={Css.bt.bGray200.p3.df.itemsCenter.justifyEnd.$}>
          <div css={Css.df.childGap1.$}>
            {actions.map((buttonProps, i) => (
              <Button key={i} {...buttonProps} />
            ))}
          </div>
        </footer>
      )}
    </>
  );
};
