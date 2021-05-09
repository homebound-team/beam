import { AnimatePresence, motion } from "framer-motion";
import { createContext, ReactChild, ReactNode, useContext, useMemo, useRef, useState } from "react";
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
interface SuperDrawerAddChildContentProps extends Pick<SuperDrawerHeaderProps, "title"> {
  content: ReactNode;
}

// Actions that can be performed to SuperDrawer
interface SuperDrawerContextActions {
  setContent: (content: SuperDrawerSetContentProps) => void;
  // TODO: Potential alternative name could be `closeSuperDrawer`
  removeContent: () => void;
  addChildContent: (childContent: SuperDrawerAddChildContentProps) => void;
  removeChildContent: () => void;
}

// Values used by SuperDrawer for rendering including `SuperDrawerHeaderProps`
interface SuperDrawerContextValues extends SuperDrawerHeaderProps {
  content: ReactNode;
  childContent: ReactNode;
}

interface SuperDrawerContextProps extends SuperDrawerContextActions, SuperDrawerContextValues {}
const SuperDrawerContext = createContext<SuperDrawerContextProps>({} as SuperDrawerContextProps);

export const useSuperDrawer = () => useContext(SuperDrawerContext);

interface SuperDrawerProviderProps {
  children: ReactChild;
}

export function SuperDrawerProvider({ children }: SuperDrawerProviderProps) {
  const [content, setContent] = useState<ReactNode>(null);
  const [childContentStack, setChildContentStack] = useState<ReactNode[]>([]);
  // Saving title into a stack since children can change the title
  const [titleStack, setTitleStack] = useState<string[]>([]);
  const onPrevClick = useRef<SuperDrawerContextProps["onPrevClick"]>();
  const onNextClick = useRef<SuperDrawerContextProps["onNextClick"]>();
  const onClose = useRef<SuperDrawerContextProps["onClose"]>();
  const childContent = useMemo(() => childContentStack?.[childContentStack.length - 1], [childContentStack]);
  const title = useMemo(() => titleStack?.[titleStack.length - 1], [titleStack]);

  const values: SuperDrawerContextValues = {
    title,
    onPrevClick: onPrevClick.current,
    onNextClick: onNextClick.current,
    onClose: onClose.current,
    content,
    childContent,
  };
  const actions: SuperDrawerContextActions = useMemo(
    () => ({
      // Set the main content of the SuperDrawer
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
      removeContent: () => {
        onPrevClick.current = undefined;
        onNextClick.current = undefined;
        onClose.current = undefined;

        setTitleStack([]);
        setContent(null);
        setChildContentStack([]);
      },
      // Add child content of the SuperDrawer
      addChildContent: ({ title: newTitle, content: childContent }) => {
        // Add newTitle, otherwise add existing title
        setTitleStack((prev) => [...prev, newTitle || title]);
        setChildContentStack((prev) => [...prev, childContent]);
      },
      removeChildContent: () => {
        // Remove current title
        setTitleStack((prev) => prev.slice(0, -1));
        setChildContentStack((prev) => prev.slice(0, -1));
      },
    }),
    [title],
  );

  const superDrawerContext: SuperDrawerContextProps = { ...values, ...actions };

  return (
    <SuperDrawerContext.Provider value={superDrawerContext}>
      {children}
      {/* TODO: Finish this connection */}
      {/* TODO: Possibly could just give all props to this component here... */}
      {/* Make sure to connect with the portal */}
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
 * TODO: Note that this does not include the header props since the caller will
 * most likely be the one that knows how to handle the title, next and prev.
 */
export const SuperDrawerContent = ({ children, actions }: SuperDrawerContentProps) => (
  <>
    <motion.div css={Css.p3.fg1.$} style={{ overflow: "auto" }}>
      {children}
    </motion.div>
    {/* Render footer section with row of given footer buttons */}
    <footer css={Css.bt.bGray200.p3.df.itemsCenter.justifyEnd.$}>
      <div css={Css.df.gap1.$}>
        {actions.map((buttonProps, i) => (
          <Button key={i} {...buttonProps} />
        ))}
      </div>
    </footer>
  </>
);

/** Right side drawer component */
export function SuperDrawer() {
  const {
    title,
    onPrevClick,
    onNextClick,
    onClose,
    content,
    childContent,
    removeContent,
    removeChildContent,
  } = useSuperDrawer();

  // FIXME: Implement errorContent
  const errorContent = null;

  function handleOnClose() {
    if (onClose) return onClose();
    return removeContent();
  }

  return (
    <AnimatePresence>
      {/* Show when there is content since childContent is related to content. */}
      {content && (
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
          <motion.div
            key="superDrawerContainer"
            css={Css.bgWhite.h100.maxw(px(1040)).w100.df.flexColumn.$}
            // Keeping initial x to 1040 as this will still work if the container is smaller
            initial={{ x: 1040 }}
            animate={{ x: 0 }}
            // Custom transitions settings for the translateX animation
            transition={{ ease: "linear", duration: 0.2, delay: 0.2 }}
            exit={{ transition: { ease: "linear", duration: 0.2 }, x: 1040 }}
          >
            <header css={Css.df.p3.bb.bGray200.df.itemsCenter.justifyBetween.$}>
              {/* Left */}
              <div css={Css.xl2Em.gray900.$}>{title}</div>
              {/* Right */}
              {/* FIXME: Handle errorContent */}
              {!errorContent && (
                <div css={Css.df.gap3.itemsCenter.$}>
                  <ButtonGroup
                    buttons={[
                      { icon: "chevronLeft", onClick: () => onPrevClick && onPrevClick(), disabled: !onPrevClick },
                      { icon: "chevronRight", onClick: () => onNextClick && onNextClick(), disabled: !onNextClick },
                    ]}
                  />
                  <IconButton icon="x" onClick={handleOnClose} />
                </div>
              )}
            </header>
            {/* FIXME: Handle errorContent */}
            {errorContent ? (
              <div css={Css.bgWhite.df.itemsCenter.justifyCenter.fg1.flexColumn.$}>{errorContent}</div>
            ) : childContent ? (
              <>
                {/* Negative margin is used to bring the childContent closer to the button to match design */}
                <div css={Css.px3.pt2.mbPx(-8).$}>
                  <Button label="Back" icon="chevronLeft" variant="tertiary" onClick={() => removeChildContent()} />
                </div>
                {childContent}
              </>
            ) : (
              content
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// TODO: Verify if all implemtation details have been moved over
function SuperDrawerBase({
  onCloseClick,
  childContent,
  children,
  onChildContentBackClick,
  secondaryLabel,
  onCancelClick,
  primaryDisabled,
  primaryLabel,
  onSubmitClick,
}: Omit<SuperDrawerProps, "onClickOutside" | "open" | "errorContent" | "onPrevClick" | "onNextClick" | "title">) {
  return (
    <>
      {childContent ? (
        <motion.div css={Css.p3.pt2.fg1.$} animate={{ overflow: "auto" }} transition={{ overflow: { delay: 0.3 } }}>
          <Button
            label="Back"
            icon="chevronLeft"
            variant="tertiary"
            onClick={
              onChildContentBackClick ||
              (() => console.warn("Missing SuperDrawer `onChildContentBackClick` prop when using `childContent` prop"))
            }
          />
          <motion.div
            key="childContent"
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
            {childContent}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div css={Css.p3.fg1.$} style={{ overflow: "auto" }}>
          {children}
        </motion.div>
      )}
    </>
  );
}

// TODO: Verify if all implemtation details have been moved over
function Footer({
  secondaryLabel,
  onCancelClick,
  onCloseClick,
  primaryLabel,
  primaryDisabled,
  onSubmitClick,
}: Pick<
  SuperDrawerProps,
  "secondaryLabel" | "onCancelClick" | "onCloseClick" | "primaryLabel" | "primaryDisabled" | "onSubmitClick"
>) {
  return (
    <footer css={Css.bt.bGray200.p3.df.itemsCenter.justifyEnd.$}>
      <div css={Css.df.gap1.$}>
        <Button
          variant="tertiary"
          label={secondaryLabel || "Cancel"}
          onClick={() => (onCancelClick ? onCancelClick() : onCloseClick())}
        />
        <Button
          variant="primary"
          label={primaryLabel || "Submit"}
          disabled={primaryDisabled}
          onClick={() => onSubmitClick()}
        />
      </div>
    </footer>
  );
}
