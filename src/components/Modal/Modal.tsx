import useResizeObserver from "@react-hook/resize-observer";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FocusScope, OverlayContainer, useDialog, useModal, useOverlay, usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { useBeamContext } from "src/components/BeamContext";
import { IconButton } from "src/components/IconButton";
import { useModal as ourUseModal } from "src/components/Modal/useModal";
import { Css, Only, px, Xss } from "src/Css";
import { Callback } from "src/types";
import { useTestIds } from "src/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  /**
   * The modal size, defaults to `md`.
   *
   * If setting just `size: sm`, we'll use default a height. If the designer requests a specific
   * height, i.e. to pixel-perfect match the content, then use `size: { width: ..., height: pixels }`.
   */
  size?: ModalSize | { width: ModalSize; height: number };
  /** The content of the modal; for consistent styling use a fragment with `<ModalBody />` and `<ModalFooter />`. */
  content: ReactNode;
  /** Force scrolling i.e. to avoid content jumping left/right as scroll bar goes away/comes back. */
  forceScrolling?: boolean;
  /** Adds a callback that is called _after_ close has definitely happened. */
  onClose?: Callback;
}

/**
 * Internal component for displaying a Modal; see `useModal` for the public API.
 *
 * Provides underlay, modal container, and header. Will disable scrolling of page under the modal.
 */
export function Modal(props: ModalProps) {
  const { size = "md", content, forceScrolling } = props;
  const isFixedHeight = typeof size !== "string";
  const ref = useRef(null);
  const { modalBodyDiv, modalFooterDiv, modalHeaderDiv, drawerContentStack } = useBeamContext();
  const { closeModal } = ourUseModal();
  const { overlayProps, underlayProps } = useOverlay(
    {
      ...props,
      isOpen: true,
      onClose: closeModal,
      isDismissable: true,
      shouldCloseOnInteractOutside: (el) => {
        // Do not close the Modal if the user is interacting with the Tribute mentions dropdown (via RichTextField).
        return !el.closest(".tribute-container");
      },
    },
    ref,
  );
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({ role: "dialog" }, ref);
  const [width, height] = getSize(size);
  const contentRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const modalFooterRef = useRef<HTMLDivElement | null>(null);
  const modalHeaderRef = useRef<HTMLHeadingElement | null>(null);
  const testId = useTestIds({}, testIdPrefix);
  usePreventScroll();

  const [hasScroll, setHasScroll] = useState(forceScrolling ?? false);

  useResizeObserver(contentRef, ({ target }) => {
    if (forceScrolling === undefined && !isFixedHeight) {
      setHasScroll(target.scrollHeight > target.clientHeight);
    }
  });

  // Even though we use raw-divs for the createPortal calls, we do actually need to
  // use refs + useEffect to stitch those raw divs back into the React component tree.
  useEffect(() => {
    // If the superdrawer is open, let it own the modal content
    if (drawerContentStack.current.length > 0) {
      return;
    }
    modalHeaderRef.current!.appendChild(modalHeaderDiv);
    modalBodyRef.current!.appendChild(modalBodyDiv);
    modalFooterRef.current!.appendChild(modalFooterDiv);
  }, [modalBodyRef, modalFooterRef, modalHeaderRef]);

  return (
    <OverlayContainer>
      <div css={Css.underlay.z4.$} {...underlayProps} {...testId.underlay}>
        <FocusScope contain restoreFocus autoFocus>
          <div
            css={
              Css.br24.bgWhite.bshModal.overflowHidden
                .maxh("90vh")
                .df.fdc.wPx(width)
                .mh(px(defaultMinHeight))
                .if(isFixedHeight)
                .hPx(height).$
            }
            ref={ref}
            {...overlayProps}
            {...dialogProps}
            {...modalProps}
            {...testId}
          >
            {/* Setup three children (header, content, footer), and flex grow the content. */}
            <header css={Css.df.p3.fs0.$}>
              <h1 css={Css.fg1.xl2Em.gray900.$} ref={modalHeaderRef} {...titleProps} {...testId.title} />
              <span css={Css.fs0.pl1.$}>
                <IconButton icon="x" onClick={closeModal} {...testId.titleClose} />
              </span>
            </header>
            <main
              ref={contentRef}
              css={Css.fg1.overflowYAuto.if(hasScroll).bb.bGray200.if(!!forceScrolling).overflowYScroll.$}
            >
              {/* We'll include content here, but we expect ModalBody and ModalFooter to use their respective portals. */}
              {content}
              <div ref={modalBodyRef} />
            </main>
            <footer css={Css.fs0.$}>
              <div ref={modalFooterRef} />
            </footer>
          </div>
        </FocusScope>
      </div>
    </OverlayContainer>
  );
}

export function ModalHeader({ children }: { children: ReactNode }): JSX.Element {
  const { modalHeaderDiv } = useBeamContext();
  return createPortal(<>{children}</>, modalHeaderDiv);
}

/** Provides consistent styling and the scrolling behavior for a modal's primary content. */
export function ModalBody({ children }: { children: ReactNode }): JSX.Element {
  const { modalBodyDiv } = useBeamContext();
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
  const { modalFooterDiv } = useBeamContext();
  const testId = useTestIds({}, testIdPrefix);
  return createPortal(
    <div css={{ ...Css.p3.df.aic.jcfe.childGap1.$, ...xss }} {...testId.footer}>
      {children}
    </div>,
    modalFooterDiv,
  );
}

const testIdPrefix = "modal";

const widths: Record<ModalSize, number> = {
  sm: 320,
  md: 480,
  lg: 640,
  xl: 800,
};

const defaultMinHeight = 204;

function getSize(size: ModalSize | { width: ModalSize; height: number }): [number, number] {
  if (typeof size === "string") {
    return [widths[size], defaultMinHeight];
  } else {
    return [widths[size.width], size.height];
  }
}
