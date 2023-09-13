import { useResizeObserver } from "@react-aria/utils";
import { MutableRefObject, PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FocusScope, OverlayContainer, useDialog, useModal, useOverlay, usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { AutoSaveStatusProvider } from "src/components";
import { useBeamContext } from "src/components/BeamContext";
import { IconButton } from "src/components/IconButton";
import { useModal as ourUseModal } from "src/components/Modal/useModal";
import { Css, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "xxl";

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
  onClose?: VoidFunction;
  /** Imperative API for interacting with the Modal */
  api?: MutableRefObject<ModalApi | undefined>;
  /** Adds a border for the header. */
  drawHeaderBorder?: boolean;
}

export type ModalApi = {
  setSize: (size: ModalProps["size"]) => void;
};

/**
 * Internal component for displaying a Modal; see `useModal` for the public API.
 *
 * Provides underlay, modal container, and header. Will disable scrolling of page under the modal.
 */
export function Modal(props: ModalProps) {
  const { size = "md", content, forceScrolling, api, drawHeaderBorder = false } = props;
  const isFixedHeight = typeof size !== "string";
  const ref = useRef(null);
  const { modalBodyDiv, modalFooterDiv, modalHeaderDiv } = useBeamContext();
  const { closeModal } = ourUseModal();
  const { overlayProps, underlayProps } = useOverlay(
    {
      ...props,
      isOpen: true,
      onClose: closeModal,
      isDismissable: true,
      shouldCloseOnInteractOutside: (el) => {
        // Do not close the Modal if the user is interacting with the Tribute mentions dropdown (via RichTextField) or with another 3rd party dialog (such as a lightbox) on top of it.
        return !(el.closest(".tribute-container") || el.closest("[role='dialog']") || el.closest("[role='alert']"));
      },
    },
    ref,
  );
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({ role: "dialog" }, ref);
  const [[width, height], setSize] = useState(getSize(size));
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const modalFooterRef = useRef<HTMLDivElement | null>(null);
  const modalHeaderRef = useRef<HTMLHeadingElement | null>(null);
  const testId = useTestIds({}, testIdPrefix);
  usePreventScroll();

  if (api) {
    api.current = { setSize: (size = "md") => setSize(getSize(size)) };
  }

  const [hasScroll, setHasScroll] = useState(forceScrolling ?? false);

  useResizeObserver({
    ref: modalBodyRef,
    onResize: useCallback(
      () => {
        const target = modalBodyRef.current!;
        if (forceScrolling === undefined && !isFixedHeight) {
          setHasScroll(target.scrollHeight > target.clientHeight);
        }
      },
      // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-internal-frontend
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  });

  // Even though we use raw-divs for the createPortal calls, we do actually need to
  // use refs + useEffect to stitch those raw divs back into the React component tree.
  useEffect(
    () => {
      modalHeaderRef.current!.appendChild(modalHeaderDiv);
      modalBodyRef.current!.appendChild(modalBodyDiv);
      modalFooterRef.current!.appendChild(modalFooterDiv);
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-internal-frontend
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalBodyRef, modalFooterRef, modalHeaderRef],
  );

  return (
    <OverlayContainer>
      <AutoSaveStatusProvider>
        <div css={Css.underlay.z4.$} {...underlayProps} {...testId.underlay}>
          <FocusScope contain restoreFocus autoFocus>
            <div
              css={
                Css.br24.bgWhite.bshModal.overflowHidden
                  .maxh("90vh")
                  .df.fdc.wPx(width)
                  .mhPx(defaultMinHeight)
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
              <header css={Css.df.p3.fs0.if(drawHeaderBorder).bb.bGray200.$}>
                <h1 css={Css.fg1.xl2Sb.gray900.$} ref={modalHeaderRef} {...titleProps} {...testId.title} />
                <span css={Css.fs0.pl1.$}>
                  <IconButton icon="x" onClick={closeModal} {...testId.titleClose} />
                </span>
              </header>
              <main
                ref={modalBodyRef}
                css={Css.fg1.overflowYAuto.if(hasScroll).bb.bGray200.if(!!forceScrolling).overflowYScroll.$}
              >
                {/* We'll include content here, but we expect ModalBody and ModalFooter to use their respective portals. */}
                {content}
              </main>
              <footer css={Css.fs0.$}>
                <div ref={modalFooterRef} />
              </footer>
            </div>
          </FocusScope>
        </div>
      </AutoSaveStatusProvider>
    </OverlayContainer>
  );
}

export function ModalHeader({ children }: { children: ReactNode }): JSX.Element {
  const { modalHeaderDiv } = useBeamContext();
  return createPortal(<>{children}</>, modalHeaderDiv);
}

/** Provides consistent styling and the scrolling behavior for a modal's primary content. */
export function ModalBody({
  children,
  virtualized = false,
}: PropsWithChildren<{ virtualized?: boolean }>): JSX.Element {
  const { modalBodyDiv } = useBeamContext();
  const testId = useTestIds({}, testIdPrefix);
  return createPortal(
    // If `virtualized`, then we are expecting the `children` will handle their own scrollbar, so have the overflow hidden and adjust padding
    <div css={Css.h100.if(virtualized).overflowHidden.pl3.else.px3.$} {...testId.content}>
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
    <div css={{ ...Css.p3.df.aic.jcfe.gap1.$, ...xss }} {...testId.footer}>
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
  xxl: 900,
};

const defaultMinHeight = 204;

function getSize(size: ModalSize | { width: ModalSize; height: number }): [number, number] {
  if (typeof size === "string") {
    return [widths[size], defaultMinHeight];
  } else {
    return [widths[size.width], size.height];
  }
}
