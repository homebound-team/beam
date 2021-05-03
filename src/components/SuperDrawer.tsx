import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { Css } from "..";
import { Button } from "./Button";
import { ButtonGroup, ButtonGroupProps } from "./ButtonGroup";
import { IconButton } from "./IconButton";

export interface SuperDrawerProps {
  /**
   * Component to render as an overlay child to the current sidebar content.
   * This should be used to present hierarchy in the sidebar content.
   * */
  childContent?: ReactNode;
  /** Component to render between the header and footer */
  children: ReactNode;
  /**
   * Handler when clicking on the "cancel" button.
   * @defaultValue `onCloseClick`
   */
  onCancelClick?: () => void;
  /** Handler when clicking on the "back" button when showing the childContent */
  onChildContentBackClick: () => void;
  /**
   * Handler when clicking on the overlay
   * @defaultValue `onCloseClick`
   */
  onClickOutside?: () => void;
  /**
   * Handler when clicking on the close icon and when clicking on the "cancel"
   * button or when clicking on the "overlay" when those onClick handlers are
   * not specified.
   */
  onCloseClick: () => void;
  /**
   * Handler when clicking on the "rightChevron" header icon. When not given,
   * the header icon will be hidden.
   */
  onNextClick?: () => void;
  /**
   * Handler when clicking on the "leftChevron" header icon. When not given,
   * the header icon will be hidden.
   */
  onPrevClick?: () => void;
  /** Handler when clicking on the "submit" button */
  onSubmitClick: () => void;
  /** Trigger the opening and closing animation of the component */
  open: boolean;
  /** Primary button disabled state */
  primaryDisabled?: boolean;
  /** Label for the primary button */
  primaryLabel?: string;
  /** Label for the tertiary (secondary) button */
  secondaryLabel?: string;
  /** Title of the header */
  title: string;
}

/** Right side drawer component */
export function SuperDrawer(props: SuperDrawerProps) {
  const {
    childContent,
    children,
    onCancelClick,
    onChildContentBackClick,
    onClickOutside,
    onCloseClick,
    onNextClick,
    onPrevClick,
    onSubmitClick,
    open,
    primaryDisabled,
    primaryLabel,
    secondaryLabel,
    title,
  } = props;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          css={Css.fixed.left0.top0.right0.bottom0.df.justifyEnd.add("backgroundColor", "rgba(36,36,36,0.2)").$}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.2 } }}
          onClick={() => (onClickOutside ? onClickOutside() : onCloseClick())}
        >
          <motion.div
            css={Css.bgWhite.h100.wPx(1040).df.flexColumn.$}
            initial={{ x: 1040 }}
            animate={{ x: 0 }}
            transition={{ ease: "linear", duration: 0.2, delay: 0.2 }}
            exit={{
              transition: { ease: "linear", duration: 0.2 },
              x: 1040,
            }}
          >
            {/* Header */}
            <header css={Css.df.p3.bb.bGray200.df.itemsCenter.justifyBetween.$}>
              {/* Left */}
              <div css={Css.xl2Em.gray900.$}>{title}</div>
              {/* Right */}
              <div css={Css.df.gap4.itemsCenter.$}>
                <ButtonGroup
                  buttons={
                    [
                      ...(onPrevClick ? [{ icon: "chevronLeft", onClick: () => onPrevClick() }] : []),
                      ...(onNextClick ? [{ icon: "chevronRight", onClick: () => onNextClick() }] : []),
                    ] as ButtonGroupProps["buttons"]
                  }
                />
                <IconButton icon="x" onClick={onCloseClick} />
              </div>
            </header>
            {/* Content */}
            {/* TODO: Handle horizontal scroll bar appearing when animating this */}
            <div css={Css.p3.fg1.overflowXAuto.$}>
              <AnimatePresence onExitComplete={() => console.log("triggered")}>
                {!childContent ? (
                  children
                ) : (
                  <>
                    <Button label="Back" icon="chevronLeft" variant="tertiary" onClick={onChildContentBackClick} />
                    <ChildContentWrapper children={childContent} onBackClick={onChildContentBackClick} />
                  </>
                )}
              </AnimatePresence>
            </div>
            {/* Footer */}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ChildContentWrapperProps {
  children: ReactNode;
  /** When clicking the back button */
  onBackClick: () => void;
}

/** ChildContent wrapper component to add a "back" button above the content */
function ChildContentWrapper(props: ChildContentWrapperProps) {
  const { children, onBackClick } = props;
  return (
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
    >
      {children}
    </motion.div>
  );
}

// TODO: Build cancelConfirmation component - fade in white background
