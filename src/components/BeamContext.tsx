import {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { OverlayProvider } from "react-aria";
import { AutoSaveStatusProvider } from "src/components/AutoSaveStatus/index";
import { BeamOverlaysContent } from "src/components/BeamOverlaysContent";
import { DocumentTitleConfig, DocumentTitleProvider } from "src/components/DocumentTitle";
import { ModalProps } from "src/components/Modal/Modal";
import { OverlayHostContext, OverlayHostContextValue } from "src/components/OverlayHostContext";
import { PresentationContextProps, PresentationProvider } from "src/components/PresentationContext";
import { SnackbarProvider } from "src/components/Snackbar/SnackbarContext";
import { ContentStack } from "src/components/SuperDrawer/useSuperDrawer";
import { CanCloseCheck, CheckFn } from "src/types";
import { EmptyRef } from "src/utils/index";
import { RightPaneProvider } from "./Layout";
import { ToastProvider } from "./Toast/ToastContext";

/** The internal state of our Beam context; see useModal and useSuperDrawer for the public APIs. */
export type BeamContextState = {
  modalState: MutableRefObject<ModalProps | undefined>;
  modalCanCloseChecks: MutableRefObject<CheckFn[]>;
  /** The div for ModalHeader to portal into. */
  modalHeaderDiv: HTMLDivElement;
  /** The div for ModalBody to portal into; note this can't be a ref b/c Modal hasn't set the ref at the time ModalBody renders. */
  modalBodyDiv: HTMLDivElement;
  /** The div for ModalFooter to portal into. */
  modalFooterDiv: HTMLDivElement;
  /** SuperDrawer contentStack, i.e. the main/non-detail content + 0-N detail contents. */
  drawerContentStack: MutableRefObject<readonly ContentStack[]>;
  /** Checks when closing SuperDrawer, for the main/non-detail drawer content. */
  drawerCanCloseChecks: MutableRefObject<CanCloseCheck[]>;
  /** Checks when closing SuperDrawer Details, a double array to keep per-detail lists. */
  drawerCanCloseDetailsChecks: MutableRefObject<CanCloseCheck[][]>;
  /** The div for SuperDrawerHeader to portal into. */
  sdHeaderDiv: HTMLDivElement;
};

/** This is only exported internally, for useModal and useSuperDrawer, it's not a public API. */
export const BeamContext = createContext<BeamContextState>({
  modalState: new EmptyRef(),
  modalCanCloseChecks: new EmptyRef(),
  modalHeaderDiv: undefined!,
  modalBodyDiv: undefined!,
  modalFooterDiv: undefined!,
  drawerContentStack: new EmptyRef(),
  drawerCanCloseChecks: new EmptyRef(),
  drawerCanCloseDetailsChecks: new EmptyRef(),
  sdHeaderDiv: undefined!,
});

type BeamProviderProps = {
  documentTitleConfig?: DocumentTitleConfig;
} & PropsWithChildren<PresentationContextProps>;

/** Root provider for Beam globals. See [`docs/overlays.md`](../../docs/overlays.md) for {@link BeamOverlays} placement. */
export function BeamProvider({ children, documentTitleConfig, ...presentationProps }: BeamProviderProps) {
  // We want the identity of these to be stable, b/c they end up being used as dependencies
  // in both useModal's and useSuperDrawer's return values, which means the end-application's
  // dependencies as well, i.e. things like GridTable rowStyles will memoize on openInDrawer.
  // So we use refs + a tick.
  const [, tick] = useReducer((prev) => prev + 1, 0);
  const modalRef = useRef<ModalProps | undefined>();
  const modalHeaderDiv = useMemo(() => document.createElement("div"), []);
  const modalBodyDiv = useMemo(() => {
    const el = document.createElement("div");
    // Ensure this wrapping div takes up the full height of its container in the case of a virtualized table within.
    el.style.height = "100%";
    return el;
  }, []);
  const modalCanCloseChecksRef = useRef<CheckFn[]>([]);
  const modalFooterDiv = useMemo(() => document.createElement("div"), []);
  const drawerContentStackRef = useRef<ContentStack[]>([]);
  const drawerCanCloseChecks = useRef<CanCloseCheck[]>([]);
  const drawerCanCloseDetailsChecks = useRef<CanCloseCheck[][]>([]);
  const sdHeaderDiv = useMemo(() => document.createElement("div"), []);

  // We essentially expose the refs, but with our own getters/setters so that we can
  // have the setters call `tick` to re-render this Provider
  const context = useMemo<BeamContextState>(() => {
    return {
      // These two keys need to trigger re-renders on change
      modalState: new PretendRefThatTicks(modalRef, tick),
      drawerContentStack: new PretendRefThatTicks(drawerContentStackRef, tick),
      // The rest we don't need to re-render when these are mutated, so just expose as-is
      modalCanCloseChecks: modalCanCloseChecksRef,
      modalHeaderDiv,
      modalBodyDiv,
      modalFooterDiv,
      drawerCanCloseChecks,
      drawerCanCloseDetailsChecks,
      sdHeaderDiv,
    };
  }, [modalBodyDiv, modalFooterDiv, modalHeaderDiv, sdHeaderDiv]);

  const [overlayHostCount, setOverlayHostCount] = useState(0);
  const hasOverlayHost = overlayHostCount > 0;

  const registerOverlayHost = useCallback(() => {
    setOverlayHostCount((count) => {
      if (process.env.NODE_ENV !== "production" && count >= 1) {
        console.warn("BeamOverlays: multiple overlay hosts mounted; mount BeamOverlays once per BeamProvider.");
      }
      return count + 1;
    });
  }, []);

  const unregisterOverlayHost = useCallback(() => {
    setOverlayHostCount((count) => Math.max(0, count - 1));
  }, []);

  const overlayHostContext = useMemo<OverlayHostContextValue>(
    () => ({ registerOverlayHost, unregisterOverlayHost }),
    [registerOverlayHost, unregisterOverlayHost],
  );

  const beamTree = (
    <OverlayHostContext.Provider value={overlayHostContext}>
      <PresentationProvider {...presentationProps}>
        <RightPaneProvider>
          <AutoSaveStatusProvider>
            <SnackbarProvider>
              {/* OverlayProvider is required for Modals generated via React-Aria */}
              <ToastProvider>
                <OverlayProvider>
                  {children}
                  {/* Fallback overlay content for apps that don't mount BeamOverlays */}
                  {!hasOverlayHost && <BeamOverlaysContent />}
                </OverlayProvider>
              </ToastProvider>
            </SnackbarProvider>
          </AutoSaveStatusProvider>
        </RightPaneProvider>
      </PresentationProvider>
    </OverlayHostContext.Provider>
  );

  return (
    <BeamContext.Provider value={{ ...context }}>
      {documentTitleConfig ? (
        <DocumentTitleProvider {...documentTitleConfig}>{beamTree}</DocumentTitleProvider>
      ) : (
        beamTree
      )}
    </BeamContext.Provider>
  );
}

/** Looks like a ref, but invokes a re-render on set (w/o changing the setter identity). */
class PretendRefThatTicks<T> implements MutableRefObject<T> {
  constructor(
    private ref: MutableRefObject<T>,
    private tick: () => void,
  ) {}
  get current(): T {
    return this.ref.current;
  }
  set current(value) {
    this.ref.current = value;
    this.tick();
  }
}

export function useBeamContext() {
  return useContext(BeamContext);
}
