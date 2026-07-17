import { createContext, MutableRefObject, PropsWithChildren, useContext, useMemo, useReducer, useRef } from "react";
import { OverlayProvider } from "react-aria";
import { AutoSaveStatusProvider } from "src/components/AutoSaveStatus/index";
import { DocumentTitleConfig, DocumentTitleProvider } from "src/components/DocumentTitle";
import { InternalModalHost } from "src/components/Modal/InternalModalHost";
import { createModalCoordinator, ModalCoordinator } from "src/components/Modal/ModalCoordinator";
import { ModalProps } from "src/components/Modal/Modal";
import { PresentationContextProps, PresentationProvider } from "src/components/PresentationContext";
import { SnackbarProvider } from "src/components/Snackbar/SnackbarContext";
import { SuperDrawer } from "src/components/SuperDrawer/SuperDrawer";
import { ContentStack } from "src/components/SuperDrawer/useSuperDrawer";
import { CanCloseCheck } from "src/types";
import { EmptyRef } from "src/utils/index";
import { RightPaneProvider } from "./Layout";
import { ToastProvider } from "./Toast/ToastContext";

/** Beam-internal API for SuperDrawer confirm modals (not for app useModal call sites). */
export type InternalModalApi = {
  openModal: (props: ModalProps) => void;
  forceClose: () => void;
};

/** The internal state of our Beam context; see useModal and useSuperDrawer for the public APIs. */
export type BeamContextState = {
  /** Coordinates one-modal-at-a-time and force-close for SuperDrawer. */
  modalCoordinator: ModalCoordinator;
  /** Set by InternalModalHost; used by useSuperDrawer for ConfirmCloseModal. */
  internalModalApi: MutableRefObject<InternalModalApi | undefined>;
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
  modalCoordinator: createModalCoordinator(),
  internalModalApi: new EmptyRef(),
  drawerContentStack: new EmptyRef(),
  drawerCanCloseChecks: new EmptyRef(),
  drawerCanCloseDetailsChecks: new EmptyRef(),
  sdHeaderDiv: undefined!,
});

type BeamProviderProps = {
  documentTitleConfig?: DocumentTitleConfig;
} & PropsWithChildren<PresentationContextProps>;

export function BeamProvider({ children, documentTitleConfig, ...presentationProps }: BeamProviderProps) {
  // We want the identity of these to be stable, b/c they end up being used as dependencies
  // in both useModal's and useSuperDrawer's return values, which means the end-application's
  // dependencies as well, i.e. things like GridTable rowStyles will memoize on openInDrawer.
  // So we use refs + a tick.
  const [, tick] = useReducer((prev) => prev + 1, 0);
  const modalCoordinator = useMemo(() => createModalCoordinator(), []);
  const internalModalApi = useRef<InternalModalApi | undefined>();
  const drawerContentStackRef = useRef<ContentStack[]>([]);
  const drawerCanCloseChecks = useRef<CanCloseCheck[]>([]);
  const drawerCanCloseDetailsChecks = useRef<CanCloseCheck[][]>([]);
  const sdHeaderDiv = useMemo(() => document.createElement("div"), []);

  // We essentially expose the refs, but with our own getters/setters so that we can
  // have the setters call `tick` to re-render this Provider
  const context = useMemo<BeamContextState>(() => {
    return {
      modalCoordinator,
      internalModalApi,
      drawerContentStack: new PretendRefThatTicks(drawerContentStackRef, tick),
      drawerCanCloseChecks,
      drawerCanCloseDetailsChecks,
      sdHeaderDiv,
    };
  }, [modalCoordinator, sdHeaderDiv]);

  const beamTree = (
    <PresentationProvider {...presentationProps}>
      <RightPaneProvider>
        <AutoSaveStatusProvider>
          <SnackbarProvider>
            {/* OverlayProvider is required for Modals generated via React-Aria */}
            <ToastProvider>
              <OverlayProvider>
                {children}
                {/* Beam-internal modal host for SuperDrawer ConfirmCloseModal only — not app useModal. */}
                <InternalModalHost />
              </OverlayProvider>
              {/* Main-style host: sibling under ToastProvider, outside OverlayProvider (not call-site). */}
              <SuperDrawer />
            </ToastProvider>
          </SnackbarProvider>
        </AutoSaveStatusProvider>
      </RightPaneProvider>
    </PresentationProvider>
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
