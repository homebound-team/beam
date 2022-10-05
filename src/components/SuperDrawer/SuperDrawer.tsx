import { Global } from "@emotion/react";
import { AutoSaveStatusProvider } from "@homebound/form-state";
import { AnimatePresence, motion } from "framer-motion";
import { ReactPortal, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ButtonGroup, IconButton, OpenInDrawerOpts, useSuperDrawer } from "src/components";
import { useBeamContext } from "src/components/BeamContext";
import { Css, px } from "src/Css";
import { useTestIds } from "src/utils";
import { SuperDrawerWidth } from "./utils";

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
export function SuperDrawer(): ReactPortal | null {
  const {
    drawerContentStack: contentStack,
    modalState,
    modalBodyDiv,
    modalFooterDiv,
    modalHeaderDiv,
  } = useBeamContext();
  const { closeDrawer } = useSuperDrawer();
  const drawerHeaderRef = useRef<HTMLDivElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const modalFooterRef = useRef<HTMLDivElement | null>(null);
  const testId = useTestIds({}, "superDrawer");

  // Steal the modal body/footer portals from Modal, if we're open
  useEffect(() => {
    if (modalBodyRef.current && modalFooterRef.current && drawerHeaderRef.current && modalState.current) {
      drawerHeaderRef.current.appendChild(modalHeaderDiv);
      modalBodyRef.current.appendChild(modalBodyDiv);
      modalFooterRef.current.appendChild(modalFooterDiv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalBodyRef.current, modalFooterRef.current, modalState.current]);

  // Get the latest element on the stack
  // We use undefined, nullish operators and empty object here to allow AnimatePresence
  // to animate the drawers exit transition when our stack is empty
  const currentContent = contentStack.current[contentStack.current.length - 1]?.opts;
  const { content } = currentContent ?? {};

  // Also get the first / non-detail element on the stack
  const firstContent = contentStack.current[0]?.opts as OpenInDrawerOpts;
  const { onPrevClick, onNextClick, titleRightContent, titleLeftContent, hideControls } = firstContent ?? {};

  const isDetail = currentContent !== firstContent;
  const title = content === undefined ? "" : currentContent.title || firstContent.title;

  const { width = SuperDrawerWidth.Normal } = firstContent ?? {};

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
            css={Css.fixed.df.jcfe.add("backgroundColor", "rgba(36,36,36,0.2)").top0.right0.bottom0.left0.z3.$}
            // Initial styles (acts similar to `from` in keyframe animations)
            initial={{ opacity: 0 }}
            // Rendered styles (acts similar to `to` in keyframe animations)
            animate={{ opacity: 1 }}
            // Unmount styles
            exit={{ opacity: 0, transition: { delay: 0.2 } }}
            onClick={closeDrawer}
          >
            {/* Content container */}
            <motion.aside
              key="superDrawerContainer"
              css={Css.bgWhite.h100.maxw(px(width)).w100.df.fdc.relative.$}
              // Keeping initial x to 1040 as this will still work if the container is smaller
              initial={{ x: width }}
              animate={{ x: 0 }}
              // Custom transitions settings for the translateX animation
              transition={{ ease: "linear", duration: 0.2, delay: 0.2 }}
              exit={{ transition: { ease: "linear", duration: 0.2 }, x: width }}
              // Preventing clicks from triggering parent onClick
              onClick={(e) => e.stopPropagation()}
            >
              <AutoSaveStatusProvider>
                <header css={Css.df.p3.bb.bGray200.df.aic.jcsb.gap2.$}>
                  {/* Left */}
                  <div css={Css.df.aic.$}>
                    <div css={Css.xl2Sb.gray900.mr2.$} {...testId.title} ref={drawerHeaderRef}>
                      {!modalState.current && (title || null)}
                    </div>
                    {!modalState.current && (titleLeftContent || null)}
                  </div>
                  {/* Right */}
                  {!modalState.current && (
                    // Forcing height to 32px to match title height
                    <div css={Css.df.gap3.aic.hPx(32).fs0.$}>
                      {titleRightContent || null}
                      {/* Disable buttons is handlers are not given or if childContent is shown */}
                      {!hideControls && (
                        <ButtonGroup
                          buttons={[
                            {
                              icon: "chevronLeft",
                              onClick: () => onPrevClick && onPrevClick(),
                              disabled: !onPrevClick || isDetail,
                            },
                            {
                              icon: "chevronRight",
                              onClick: () => onNextClick && onNextClick(),
                              disabled: !onNextClick || isDetail,
                            },
                          ]}
                          {...testId.headerActions}
                        />
                      )}
                      <IconButton icon="x" onClick={closeDrawer} {...testId.close} />
                    </div>
                  )}
                </header>
                {content}
                {modalState.current && (
                  // Forcing some design constraints on the modal component
                  <div
                    css={
                      // topPX(81) is the offset from the header
                      Css.fg1.topPx(81).left0.right0.bottom0.absolute.bgWhite.df.aic.jcc.fg1.fdc.z5.$
                    }
                  >
                    {/* We'll include content here, but we expect ModalBody and ModalFooter to use their respective portals. */}
                    {modalState.current.content}
                    {/* TODO: Work in some notion of the modal size + width/height + scrolling?*/}
                    <div ref={modalBodyRef} />
                    <div ref={modalFooterRef} />
                  </div>
                )}
              </AutoSaveStatusProvider>
            </motion.aside>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
