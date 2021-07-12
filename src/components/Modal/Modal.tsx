import useResizeObserver from "@react-hook/resize-observer";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { FocusScope, OverlayContainer, useDialog, useModal, useOverlay, usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { BeamContext } from "src/components/BeamContext";
import { IconButton } from "src/components/IconButton";
import { useModal as ourUseModal } from "src/components/Modal/useModal";
import { Css, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  title: string;
  /**
   * The modal size, defaults to `md`.
   *
   * If setting just `size: sm`, we'll default a height. If a designer request a specific
   * height to pixel-perfect match teh content, then use `size: { width: ..., height: pixels }`.
   */
  size?: ModalSize | { width: ModalSize; height: number };
  /** The content of the modal; for consistent styling use a fragment with `<ModalBody />` and `<ModalFooter />`. */
  content: ReactNode;
}

/**
 * Internal component for displaying a Modal; see `useModal` for the public API.
 *
 * Provides underlay, modal container, and header. Will disable scrolling of page under the modal.
 */
export function Modal(props: ModalProps) {
  const { title, size = "md", content } = props;
  const ref = useRef(null);
  const { modalBodyDiv, modalFooterDiv, contentStack } = useContext(BeamContext);
  const { closeModal } = ourUseModal();
  const { overlayProps, underlayProps } = useOverlay(
    { ...props, isOpen: true, onClose: closeModal, isDismissable: true },
    ref,
  );
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({ role: "dialog" }, ref);
  const [width, height] = getSize(size);
  const contentRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const modalFooterRef = useRef<HTMLDivElement | null>(null);
  const testId = useTestIds({}, testIdPrefix);
  usePreventScroll();

  const [hasScroll, setHasScroll] = useState(false);
  // This would be great to have work, but seems like the contentRef cannot be added/removed from the DOM or it breaks.
  // Still trying to work on it, though... must be another way around it.
  useResizeObserver(contentRef, ({ target }) => {
    setHasScroll(target.scrollHeight > target.clientHeight);
  });

  // Even though we use raw-divs for the createPortal calls, we do actually need to
  // use refs + useEffect to stitch those raw divs back into the React component tree.
  useEffect(() => {
    // If the superdrawer is open, let it own the modal content
    if (contentStack.current.length > 0) {
      return;
    }
    modalBodyRef.current!.appendChild(modalBodyDiv);
    modalFooterRef.current!.appendChild(modalFooterDiv);
  }, [modalBodyRef, modalFooterRef]);

  return (
    <OverlayContainer>
      <div css={Css.underlay.z4.$} {...underlayProps} {...testId.underlay}>
        <FocusScope contain restoreFocus autoFocus>
          <div
            css={Css.br24.bgWhite.bshModal.maxh("90vh").df.flexColumn.wPx(width).hPx(height).$}
            ref={ref}
            {...overlayProps}
            {...dialogProps}
            {...modalProps}
            {...testId}
          >
            {/* Setup three children (header, content, footer), and flex grow the content. */}
            <header css={Css.df.p3.fs0.$}>
              <h1 css={Css.fg1.xl2Em.gray900.$} {...titleProps} {...testId.title}>
                {title}
              </h1>
              <span css={Css.fs0.pl1.$}>
                <IconButton icon="x" onClick={closeModal} {...testId.titleClose} />
              </span>
            </header>
            <div ref={contentRef} css={Css.fg1.overflowYAuto.if(hasScroll).bb.bGray200.$}>
              {/* We'll include content here, but we expect ModalBody and ModalFooter to use their respective portals. */}
              {content}
              <div ref={modalBodyRef} />
            </div>
            <div css={Css.fs0.$}>
              <div ref={modalFooterRef} />
            </div>
          </div>
        </FocusScope>
      </div>
    </OverlayContainer>
  );
}

/** Provides consistent styling and the scrolling behavior for a modal's primary content. */
export function ModalBody({ children }: { children: ReactNode }): JSX.Element {
  const { modalBodyDiv } = useContext(BeamContext);
  const testId = useTestIds({}, testIdPrefix);
  return createPortal(
    <div css={Css.px3.$} {...testId.content}>
      {children}
    </div>,
    modalBodyDiv,
  );
}

type ModalFooterXss = Xss<"justifyContent" | "alignItems">;

/** Provides consistent styling for modal footers, i.e. where actions are placed. */
export function ModalFooter<X extends Only<ModalFooterXss, X>>({
  children,
  xss,
}: {
  children: ReactNode;
  xss?: X;
}): JSX.Element {
  const { modalFooterDiv } = useContext(BeamContext);
  const testId = useTestIds({}, testIdPrefix);
  return createPortal(
    <div css={{ ...Css.p3.df.itemsCenter.justifyEnd.$, ...xss }} {...testId.footer}>
      {children}
    </div>,
    modalFooterDiv,
  );
}

const testIdPrefix = "modal";

function getSize(size: ModalSize | { width: ModalSize; height: number }): [number, number] {
  const widthAbbr: ModalSize = typeof size === "string" ? size : size.width;
  const width = widthAbbr === "sm" ? 320 : widthAbbr === "md" ? 480 : 640;
  const height = typeof size === "string" ? width * 1.1 : size.height;
  return [width, height];
}
