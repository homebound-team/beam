import { createContext, MutableRefObject, ReactNode, useMemo, useReducer, useRef } from "react";
import { OverlayProvider } from "react-aria";
import { Modal, ModalProps } from "src/components/Modal/Modal";
import { SuperDrawer } from "src/components/SuperDrawer/SuperDrawer";
import { ContentStack } from "src/components/SuperDrawer/useSuperDrawer";
import { EmptyRef } from "src/utils/index";

/** The internal state of our Beam context; see useModal and useSuperDrawer for the public APIs. */
export interface BeamContextState {
  contentStack: MutableRefObject<ContentStack[]>;
  modalState: MutableRefObject<ModalProps | undefined>;
  canCloseChecks: MutableRefObject<Array<() => boolean>>;
}

/** This is only exported internally, for useModal and useSuperDrawer, it's not a public API. */
export const BeamContext = createContext<BeamContextState>({
  contentStack: new EmptyRef(),
  modalState: new EmptyRef(),
  canCloseChecks: new EmptyRef(),
});

export function BeamProvider({ children }: { children: ReactNode }) {
  // We want the identity of these to be stable, b/c they end up being used as dependencies
  // in both useModal's and useSuperDrawer's return values, which means the end-application's
  // dependencies as well, i.e. things like GridTable rowStyles will memoize on openInDrawer.
  // So we use refs + a tick.
  const [, tick] = useReducer((prev) => prev + 1, 0);
  const modalRef = useRef<ModalProps | undefined>();
  const contentStackRef = useRef<ContentStack[]>([]);
  const canCloseChecksRef = useRef<Array<() => boolean>>([]);

  // We essentially expose the refs, but with our own getters/setters so that we can
  // have the setters call `tick` to re-render this Provider
  const context = useMemo<BeamContextState>(() => {
    return {
      modalState: {
        get current() {
          return modalRef.current;
        },
        set current(value) {
          modalRef.current = value;
          tick();
        },
      },
      contentStack: {
        get current() {
          return contentStackRef.current;
        },
        set current(value) {
          contentStackRef.current = value;
          tick();
        },
      },
      // We don't need to rerender when this is mutated, so just expose as-is
      canCloseChecks: canCloseChecksRef,
    };
  }, []);

  return (
    <BeamContext.Provider value={context}>
      {/* OverlayProvider is required for Modals generated via React-Aria */}
      <OverlayProvider>
        {children}
        {/*If the drawer is open, assume it will show modal content internally. */}
        {modalRef.current && contentStackRef.current.length === 0 && <Modal {...modalRef.current} />}
      </OverlayProvider>
      <SuperDrawer />
    </BeamContext.Provider>
  );
}
