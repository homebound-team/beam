import { AnimatePresence, motion } from "framer-motion";
import { createContext, ReactChild, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
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
   * @default Closes the SuperDrawer by calling `removeContent()`
   */
  onClose?: () => void;
}

interface SuperDrawerSetContentProps extends SuperDrawerHeaderProps {
  content: ReactNode;
}
// When adding childContent, a new title can be chosen
interface SuperDrawerAddChildContentProps extends Partial<Pick<SuperDrawerHeaderProps, "title">> {
  content: ReactNode;
}

// Actions that can be performed to SuperDrawer
interface SuperDrawerContextActions {
  /** Opens and sets the SuperDrawer content and footer component. */
  setContent: (content: SuperDrawerSetContentProps) => void;
  /** Closes and reset SuperDrawer state. */
  removeContent: () => void;
  /** Add a child component to the SuperDrawer childContentStack */
  addChildContent: (childContent: SuperDrawerAddChildContentProps) => void;
  /**
   * Removes a child component to the SuperDrawer childContentStack. When no
   * more child contents are left in the stack the main content will be shown.
   */
  removeChildContent: () => void;
  /** Shows the errorComponent */
  setErrorContent: (content: Omit<SuperDrawerAddChildContentProps, "title">) => void;
  /** Removes the errorComponent */
  removeErrorContent: () => void;
}

// Values used by SuperDrawer for rendering including `SuperDrawerHeaderProps`
interface SuperDrawerContextValues extends SuperDrawerHeaderProps {
  content: ReactNode;
  childContent: ReactNode;
  errorContent: ReactNode;
}

interface SuperDrawerContextProps extends SuperDrawerContextActions, SuperDrawerContextValues {}
const SuperDrawerContext = createContext<SuperDrawerContextProps>({} as SuperDrawerContextProps);

export const useSuperDrawer = () => useContext(SuperDrawerContext);

interface SuperDrawerProviderProps {
  children: ReactChild;
}

export function SuperDrawerProvider({ children }: SuperDrawerProviderProps) {
  // Main content, childContent and errorContent
  const [content, setContent] = useState<ReactNode>(null);
  const [childContentStack, setChildContentStack] = useState<ReactNode[]>([]);
  const [errorContent, setErrorContent] = useState<ReactNode>(null);
  // Saving title into a stack since children can change the title
  const [titleStack, setTitleStack] = useState<string[]>([]);
  const onPrevClick = useRef<SuperDrawerContextProps["onPrevClick"]>();
  const onNextClick = useRef<SuperDrawerContextProps["onNextClick"]>();
  const onClose = useRef<SuperDrawerContextProps["onClose"]>();
  // Computed values
  const childContent = useMemo(() => childContentStack?.[childContentStack.length - 1], [childContentStack]);
  const title = useMemo(() => titleStack?.[titleStack.length - 1], [titleStack]);

  // Building context object
  const values: SuperDrawerContextValues = {
    title,
    onPrevClick: onPrevClick.current,
    onNextClick: onNextClick.current,
    onClose: onClose.current,
    content,
    childContent,
    errorContent,
  };
  const actions: SuperDrawerContextActions = useMemo(
    () => ({
      /** Opens and sets the SuperDrawer content and footer component. */
      setContent: ({
        title: newTitle,
        onPrevClick: newOnPrevClick,
        onNextClick: newOnNextClick,
        onClose: newOnClose,
        content,
      }) => {
        onPrevClick.current = newOnPrevClick;
        onNextClick.current = newOnNextClick;
        onClose.current = newOnClose;

        setTitleStack((prev) => [...prev, newTitle]);
        setContent(content);
      },
      /** Closes and reset SuperDrawer state. */
      removeContent: () => {
        onPrevClick.current = undefined;
        onNextClick.current = undefined;
        onClose.current = undefined;

        setTitleStack([]);
        setContent(null);
        setChildContentStack([]);
        setErrorContent(null);
      },
      /** Add a child component to the SuperDrawer childContentStack */
      addChildContent: ({ title: newTitle, content: childContent }) => {
        // Add newTitle, otherwise add existing title
        setTitleStack((prev) => [...prev, newTitle || title]);
        setChildContentStack((prev) => [...prev, childContent]);
      },
      /**
       * Removes a child component to the SuperDrawer childContentStack. When no
       * more child contents are left in the stack the main content will be shown.
       */
      removeChildContent: () => {
        // Remove current title
        setTitleStack((prev) => prev.slice(0, -1));
        setChildContentStack((prev) => prev.slice(0, -1));
      },
      /** Shows the errorComponent */
      setErrorContent: ({ content }) => {
        setErrorContent(content);
      },
      /** Removes the errorComponent */
      removeErrorContent: () => {
        setErrorContent(null);
      },
    }),
    [title],
  );

  // TODO: Validate re-render issue?
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
  type?: "content" | "childContent";
}

/**
 * Helper component to place the given children and actions into the appropriate
 * DOM format to render inside the SuperDrawer.
 *
 * NOTE: This does not include the header props since the caller will
 * most likely be the one that knows how to handle the title, prev/next link
 * and onClose handler.
 */
export const SuperDrawerContent = ({ children, actions, type = "content" }: SuperDrawerContentProps) => {
  const { removeChildContent } = useSuperDrawer();

  const ContentWrapper = useCallback(
    ({ children }: { children: ReactNode }) =>
      type === "content" ? (
        <motion.div key="content" css={Css.p3.fg1.$} style={{ overflow: "auto" }}>
          {children}
        </motion.div>
      ) : (
        <motion.div
          css={Css.px3.pt2.pb3.fg1.$}
          animate={{ overflow: "auto" }}
          transition={{ overflow: { delay: 0.3 } }}
        >
          <Button label="Back" icon="chevronLeft" variant="tertiary" onClick={() => removeChildContent()} />
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
    [type, removeChildContent],
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
  const {
    title,
    onPrevClick,
    onNextClick,
    onClose,
    content,
    childContent,
    errorContent,
    removeContent,
  } = useSuperDrawer();

  function handleOnClose() {
    if (onClose) return onClose();
    return removeContent();
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
              {!errorContent && (
                // Forcing height to 32px to match title height
                <div css={Css.df.childGap3.itemsCenter.hPx(32).$}>
                  {/* Disable buttons is handlers are not given or if childContent is shown */}
                  <ButtonGroup
                    buttons={[
                      {
                        icon: "chevronLeft",
                        onClick: () => onPrevClick && onPrevClick(),
                        disabled: !onPrevClick || !!childContent,
                      },
                      {
                        icon: "chevronRight",
                        onClick: () => onNextClick && onNextClick(),
                        disabled: !onNextClick || !!childContent,
                      },
                    ]}
                  />
                  <IconButton icon="x" onClick={handleOnClose} />
                </div>
              )}
            </header>
            {errorContent ? (
              // Forcing some design constraints on the error component
              <div css={Css.bgWhite.df.itemsCenter.justifyCenter.fg1.flexColumn.$}>{errorContent}</div>
            ) : childContent ? (
              childContent
            ) : (
              content
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
