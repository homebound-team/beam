import { useResizeObserver } from "@react-aria/utils";
import { MutableRefObject, PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FocusScope, OverlayContainer, useDialog, useModal, useOverlay, usePreventScroll } from "react-aria";
import { createPortal } from "react-dom";
import { AutoSaveStatusProvider } from "src/components";
import { useBeamContext } from "src/components/BeamContext";
import { IconButton } from "src/components/IconButton";
import { BlueprintAiLogo } from "src/components/Logos";
import { useModal as ourUseModal } from "src/components/Modal/useModal";
import { Css, Only, Tokens, Xss } from "src/Css";
import { useBreakpoint } from "src/hooks";
import { useTestIds } from "src/utils";
import { zIndices } from "src/utils/zIndices";
import { ModalProvider } from "./ModalContext";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "xxl";

export type ModalProps = {
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
  /**
   * Defaults to `true`
   * Renders `x` icon and closes modal when users click outside of it.
   *
   * When false, relies on you to provide a way to close the modal, i.e. a cancel or confirm button.
   * Useful if you definitely need to force the user to make a choice.
   * */
  allowClosing?: boolean;
  /**
   * Applies the Blueprint AI style: AiLogo, gradient title, ai primary action variant
   */
  aiMode?: boolean;
};

export type ModalApi = {
  setSize: (size: ModalProps["size"]) => void;
};

/**
 * Internal component for displaying a Modal; see `useModal` for the public API.
 *
 * Provides underlay, modal container, and header. Will disable scrolling of page under the modal.
 */
export function Modal(props: ModalProps) {
  const {
    size = "md",
    content,
    forceScrolling,
    api,
    drawHeaderBorder = false,
    allowClosing = true,
    aiMode = false,
  } = props;
  const isFixedHeight = typeof size !== "string";
  const ref = useRef(null);
  const { modalBannerDiv, modalBodyDiv, modalFooterDiv, modalHeaderDiv } = useBeamContext();
  const { closeModal } = ourUseModal();
  const { overlayProps, underlayProps } = useOverlay(
    {
      ...props,
      isOpen: true,
      onClose: closeModal,
      isDismissable: true,
      shouldCloseOnInteractOutside: (el) => {
        // Do not close the Modal if the user is interacting with the Tribute mentions dropdown (via RichTextField),
        // with another 3rd party dialog (such as a lightbox), or with a tooltip on top of it.
        return (
          allowClosing &&
          !(
            el.closest(".tribute-container") ||
            el.closest("[role='dialog']") ||
            el.closest("[role='alert']") ||
            el.closest("[role='tooltip']")
          )
        );
      },
    },
    ref,
  );
  const { modalProps } = useModal();
  const { dialogProps, titleProps } = useDialog({ role: "dialog" }, ref);
  const [[width, height], setSize] = useState(getSize(size));
  const modalBannerRef = useRef<HTMLDivElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const modalFooterRef = useRef<HTMLDivElement | null>(null);
  const modalHeaderRef = useRef<HTMLHeadingElement | null>(null);
  const testId = useTestIds({}, testIdPrefix);
  usePreventScroll();
  const { sm } = useBreakpoint();

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
      // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  });

  // Even though we use raw-divs for the createPortal calls, we do actually need to
  // use refs + useEffect to stitch those raw divs back into the React component tree.
  useEffect(
    () => {
      modalHeaderRef.current!.appendChild(modalHeaderDiv);
      modalBannerRef.current!.appendChild(modalBannerDiv);
      modalBodyRef.current!.appendChild(modalBodyDiv);
      modalFooterRef.current!.appendChild(modalFooterDiv);
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalBannerRef, modalBodyRef, modalFooterRef, modalHeaderRef],
  );

  const title = (
    <h1
      css={Css.fg1.xl2.if(aiMode).aiBoldText.else.color(Tokens.OnSurface).$}
      ref={modalHeaderRef}
      {...titleProps}
      {...testId.title}
    />
  );

  return (
    <ModalProvider aiMode={aiMode}>
      <OverlayContainer>
        <AutoSaveStatusProvider>
          <div css={Css.underlay.z(zIndices.modalUnderlay).$} {...underlayProps} {...testId.underlay}>
            <FocusScope contain restoreFocus autoFocus>
              <div
                css={
                  Css.br24
                    .bgColor(Tokens.Surface)
                    .bshModal.oh.maxh("90vh")
                    .df.fdc.wPx(width)
                    .mhPx(defaultMinHeight)
                    .if(isFixedHeight)
                    .hPx(height)
                    .if(sm)
                    .add("height", "100dvh")
                    .add("width", "100dvw")
                    .maxh("none").br0.$
                }
                ref={ref}
                {...overlayProps}
                {...dialogProps}
                {...modalProps}
                {...testId}
              >
                {/*
                  Setup four children (header, banner, content, footer), and flex grow the content.

                  Use `fdrr` so that the close icon won't sit between "modal header search field"
                  and the modal body results in the DOM focus order, i.e. in our global search modal.
                */}
                <header css={Css.df.fdrr.p3.fs0.if(drawHeaderBorder).bb.bc(Tokens.SurfaceSeparator).$}>
                  <span css={Css.fs0.pl1.$}>
                    {allowClosing && <IconButton icon="x" onClick={closeModal} {...testId.titleClose} />}
                  </span>
                  {aiMode ? (
                    <div css={Css.df.fdc.aifs.gapPx(4).fg1.mw0.$} {...testId.aiTitle}>
                      <BlueprintAiLogo height={2} />
                      {title}
                    </div>
                  ) : (
                    title
                  )}
                </header>
                {/* Full-bleed and outside `main` so a banner spans the modal and stays put as the body scrolls. */}
                <div ref={modalBannerRef} css={Css.fs0.$} />
                <main
                  ref={modalBodyRef}
                  css={Css.fg1.oya.if(hasScroll).bb.bc(Tokens.SurfaceSeparator).if(!!forceScrolling).oys.$}
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
    </ModalProvider>
  );
}

export function ModalHeader({ children }: { children: ReactNode }): JSX.Element {
  const { modalHeaderDiv } = useBeamContext();
  return createPortal(<>{children}</>, modalHeaderDiv);
}

/** A full-bleed slot between the header and the body, i.e. for an `AiSlimBanner`. */
export function ModalBanner({ children }: { children: ReactNode }): JSX.Element {
  const { modalBannerDiv } = useBeamContext();
  const testId = useTestIds({}, testIdPrefix);
  // The body has no top padding of its own, so the banner restores the gap the header would have left.
  return createPortal(
    <div css={Css.mb3.$} {...testId.banner}>
      {children}
    </div>,
    modalBannerDiv,
  );
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
    <div css={Css.h100.if(virtualized).oh.pl3.else.px3.$} {...testId.content}>
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
