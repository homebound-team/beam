import { AnimatePresence, motion } from "framer-motion";
import { createContext, ReactChild, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Css, px } from "src";
import { Button, ButtonProps } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { IconButton } from "./IconButton";

interface SuperDrawerHeaderProps {
  /** Title of the SuperDrawer */
  title: string;
  /**
   * Handlers for left and right header button group. Shows disabled state
   * otherwise.
   */
  onPrevClick?: () => void;
  onNextClick?: () => void;
  /**
   * Handler when clicking on the following elements:
   * - `X` icon
   * - Background overlay
   *
   * @default Closes the SuperDrawer by calling `closeDrawer()`
   */
  onClose?: () => void;
}

// When adding a new element to the stack
interface SuperDrawerNewOpenInDrawerProps extends SuperDrawerHeaderProps {
  content: ReactNode;
  mode?: "new";
}
// When adding a detail element to the stack
interface SuperDrawerDetailOpenInDrawerProps extends Partial<Pick<SuperDrawerHeaderProps, "title">> {
  content: ReactNode;
  mode: "detail";
}

type SuperDrawerOpenInDrawerProps = SuperDrawerNewOpenInDrawerProps | SuperDrawerDetailOpenInDrawerProps;

// Values used by SuperDrawer for rendering including `SuperDrawerHeaderProps`
interface SuperDrawerContextValues {
  contentStack: SuperDrawerOpenInDrawerProps[];
  modalContent?: ReactNode;
}

// Actions that can be performed to SuperDrawer
interface SuperDrawerContextActions {
  /**
   * Adds a new element to the SuperDrawer content stack which can be of two types.
   *
   * These types are controlled by the `mode` key defined by `SuperDrawerOpenInDrawerProps`:
   * - "new": represents a new element that will erase all other element on the contentStack
   * - "detail": represents a detail element that will be pushed onto contentStack
   *
   * The only difference between `new` and `detail` mode are the visual states that SuperDrawer
   * adds to help with navigation. For example, when adding a `detail` element, a "back" button
   * will be injected into the content area to help users navigate back to the `new` (can also be called "main") content.
   *
   */
  openInDrawer: (content: SuperDrawerOpenInDrawerProps) => void;
  /**
   * Pops and element from the SuperDrawer content stack. If the resulting pop
   * causes the stack to have no more elements, the SuperDrawer will close.
   */
  closeInDrawer: () => void;
  /** Clears the SuperDrawer content stack and closes the drawer */
  closeDrawer: () => void;
  /** Shows the given component as the SuperDrawer modal */
  setModalContent: (content: ReactNode) => void;
  /** Closes the modal */
  closeModal: () => void;
}

interface SuperDrawerContextProps extends SuperDrawerContextActions, SuperDrawerContextValues {}
const SuperDrawerContext = createContext<SuperDrawerContextProps>({} as SuperDrawerContextProps);

export const useSuperDrawer = () => useContext(SuperDrawerContext);

export function SuperDrawerProvider({ children }: { children: ReactChild }) {
  const [contentStack, setContentStack] = useState<SuperDrawerOpenInDrawerProps[]>([]);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  // Building context object
  const values: SuperDrawerContextValues = { contentStack, modalContent };
  const actions: SuperDrawerContextActions = useMemo(
    () => ({
      openInDrawer: (content) => {
        const { mode = "new", title } = content;

        // When mode is not given, or "new", reset the contentStack
        if (mode === "new") {
          setContentStack([{ ...content, mode } as SuperDrawerNewOpenInDrawerProps]);
        }
        // Otherwise push the element onto the stack
        else {
          setContentStack((prev) => {
            if (prev.length === 0) {
              console.error("SuperDrawer must have at least one `new` element before adding a `detail` element.");
              return prev;
            }

            return [
              ...prev,
              {
                ...content,
                // Defaulting optional title to previous elements title
                title: title ?? prev[prev.length - 1].title,
              } as SuperDrawerDetailOpenInDrawerProps,
            ];
          });
        }
      },
      closeInDrawer: () => setContentStack((prev) => prev.slice(0, -1)),
      closeDrawer: () => {
        setContentStack([]);
        setModalContent(null);
      },
      setModalContent: (content) => setModalContent(content),
      closeModal: () => setModalContent(null),
    }),
    [],
  );

  const superDrawerContext: SuperDrawerContextProps = { ...values, ...actions };

  return (
    <SuperDrawerContext.Provider value={superDrawerContext}>
      {children}
      {/* TODO: Use React.createPortal is zIndex becomes an issue */}
      <SuperDrawer />
    </SuperDrawerContext.Provider>
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
