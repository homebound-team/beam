import useResizeObserver from "@react-hook/resize-observer";
import { ReactNode, useRef, useState } from "react";
import { FocusScope, OverlayContainer, useDialog, useModal, useOverlay, usePreventScroll } from "react-aria";
import { IconButton } from "src/components/IconButton";
import { useModal as ourUseModal } from "src/components/Modal/useModal";
import { Css, Only, Xss } from "src/Css";
import { Callback } from "src/types";
import { useTestIds } from "src/utils";

export interface ModalProps {
  title: string;
  size?: "sm" | "md" | "lg";
  content: ReactNode;
  onClose?: Callback;
}

/**
 * Internal component for displaying a Modal; see `useModal` for the public API.
 *
 * Provides underlay, modal container, and header. Will disable scrolling of page under the modal.
 *
 * For consistent styling and behaviors between Modals, use `<ModalBody />` and `<ModalFooter>` within `ModalProps.content`.
 */
export function Modal(props: ModalProps) {
  const { title, size = "md", content } = props;
  const width = size === "sm" ? 320 : size === "md" ? 480 : 640;
  const ref = useRef(null);
  const { onClose } = ourUseModal();
  const { overlayProps, underlayProps } = useOverlay({ ...props, isOpen: true, onClose, isDismissable: true }, ref);
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({ role: "dialog" }, ref);
  const testId = useTestIds({}, testIdPrefix);
  usePreventScroll();

  return (
    <OverlayContainer>
      <div css={Css.underlay.z4.$} {...underlayProps} {...testId.underlay}>
        <FocusScope contain restoreFocus autoFocus>
          <div
            css={Css.br24.bgWhite.bshModal.maxh("90vh").df.flexColumn.wPx(width).$}
            ref={ref}
            {...overlayProps}
            {...dialogProps}
            {...modalProps}
            {...testId}
          >
            <header css={Css.df.p3.$}>
              <h1 css={Css.fg1.xl2Em.gray900.$} {...titleProps} {...testId.title}>
                {title}
              </h1>
              <span css={Css.fs0.pl1.$}>
                <IconButton icon="x" onClick={onClose} {...testId.titleClose} />
              </span>
            </header>
            <>{content}</>
          </div>
        </FocusScope>
      </div>
    </OverlayContainer>
  );
}

// Component to supply consistent styling and the scrolling behavior for a Modal's content
export function ModalBody({ children }: { children: ReactNode }) {
  const testId = useTestIds({}, testIdPrefix);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  // This would be great to have work, but seems like the contentRef cannot be added/removed from the DOM or it breaks.
  // Still trying to work on it, though... must be another way around it.
  useResizeObserver(contentRef, ({ target }) => {
    setHasScroll(target.scrollHeight > target.clientHeight);
  });

  return (
    <div css={Css.px3.overflowYAuto.if(hasScroll).bb.bGray200.$} ref={contentRef} {...testId.content}>
      {children}
    </div>
  );
}

type ModalFooterXss = Xss<"justifyContent" | "alignItems">;
// Component to supply consistent styling for Modal Footer - Typically where the Modal actions are placed.
export function ModalFooter<X extends Only<ModalFooterXss, X>>({ children, xss }: { children: ReactNode; xss?: X }) {
  const testId = useTestIds({}, testIdPrefix);
  return (
    <div css={{ ...Css.p3.df.itemsCenter.justifyEnd.$, ...xss }} {...testId.footer}>
      {children}
    </div>
  );
}

const testIdPrefix = "modal";
