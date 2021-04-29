import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { Css } from "..";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { IconButton } from "./IconButton";

type SuperDrawerProps = {
  /** Trigger the opening and closing animation of the component */
  open: boolean;
  children: ReactNode;
  title: string;
  /** When given, the left header chevron is shown */
  onLeftClick?: () => void;
  /** When given, the right header chevron is shown */
  onRightClick?: () => void;
  /**
   * Handler when clicking on the close icon
   * TODO: Should this even happen or should it be handled outside the component
   * Internally we can control the animation.
   * @default closes the drawer
   * */
  onCloseClick: () => void;
  /**
   * Handler when clicking on the overlay
   * @default to use onCloseClick
   */
  onClickOutside?: () => void;
  /**
   * Handler when clicking on the "cancel" button.
   * TODO: Should this even happen or should it be handled outside the component
   * TODO: This button can default to the X button....
   * @default to use onCloseClick
   *  */
  onCancelClick?: () => void;
  /** Handler when clicking on the "submit" button */
  onSubmitClick: () => void;
  /** Label for the "submit" button */
  primaryLabel?: string;
  /** Primary button disabled state */
  primaryDisabled?: boolean;
  /** Label for the "cancel" button */
  secondaryLabel?: string;
  /** Component to render as a overlay child to the current sidebar content */
  childContent?: ReactNode;
  /** Required handler when giving a childContent component */
  onChildContentBackClick?: () => void;
};

/** Right side drawer component */
export function SuperDrawer(props: SuperDrawerProps) {
  const {
    open,
    children,
    onLeftClick,
    onRightClick,
    onCloseClick,
    onCancelClick,
    primaryLabel,
    onClickOutside,
    secondaryLabel,
    primaryDisabled,
    childContent,
    onChildContentBackClick,
  } = props;
  return (
    // TODO: Could this be as :before
    // TODO: Semantics, could this be aside?
    // TODO: Have both of these slide is at different speeds
    <AnimatePresence>
      {open && (
        <motion.div
          key={"superDrawer"}
          css={Css.fixed.left0.top0.right0.bottom0.df.justifyEnd.add("backgroundColor", "rgba(36,36,36,0.2)").$}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => (onClickOutside ? onClickOutside() : onCloseClick())}
        >
          <motion.div
            css={Css.bgWhite.h100.wPx(1040).df.flexColumn.$}
            initial={{ x: 1040 }}
            animate={{ x: 0 }}
            transition={{ ease: "linear", duration: 0.2 }}
            exit={{ x: 1040 }}
          >
            {/* Header */}
            <header css={Css.df.p3.bb.bGray200.df.itemsCenter.justifyBetween.$}>
              {/* Left */}
              <div css={Css.xl2Em.gray900.$}>Title</div>
              {/* Right */}
              <div css={Css.df.gap4.itemsCenter.$}>
                <ButtonGroup
                  buttons={[
                    onLeftClick ? { icon: "chevronLeft", onClick: onLeftClick } : undefined,
                    onRightClick ? { icon: "chevronRight", onClick: onRightClick } : undefined,
                  ]}
                />
                <IconButton icon="x" onClick={onCloseClick} />
              </div>
            </header>
            {/* Content */}
            {/* TODO: Semantics of this, could it be main or section */}
            {/* TODO: Handle horizontal scroll bar appearing when animating this */}
            <div css={Css.p3.fg1.overflowAuto.$}>
              <AnimatePresence>
                {!childContent ? (
                  children
                ) : (
                  <ChildContentWrapper children={childContent} onBackClick={onChildContentBackClick} />
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
                <Button variant="primary" label={primaryLabel || "Submit"} disabled={primaryDisabled} />
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ChildContentWrapperProps = {
  children: ReactNode;
  /** When clicking the back button */
  onBackClick: () => void;
};
function ChildContentWrapper(props: ChildContentWrapperProps) {
  const { children, onBackClick } = props;
  return (
    <motion.div
      initial={{ x: 1040 }}
      animate={{ x: 0 }}
      transition={{ ease: "linear", duration: 0.2 }}
      exit={{ x: 1040 }}
    >
      <Button label="Back" icon="chevronLeft" variant="tertiary" onClick={onBackClick} />
      {children}
    </motion.div>
  );
}

// TODO: Build cancelConfirmation component
