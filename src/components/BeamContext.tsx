import { createContext, MutableRefObject, ReactNode, useMemo, useReducer, useRef } from "react";
import { OverlayProvider } from "react-aria";
import { Modal, ModalProps } from "src/components/Modal/Modal";
import { SuperDrawer } from "src/components/SuperDrawer/SuperDrawer";
import { ContentStack } from "src/components/SuperDrawer/useSuperDrawer";
import { EmptyRef } from "src/utils/index";

/** The internal state of our Beam context; see useModal and useSuperDrawer for the public APIs. */
export interface BeamContextState {
  // SuperDrawer contentStack
  contentStack: MutableRefObject<readonly ContentStack[]>;
  modalState: MutableRefObject<ModalProps | undefined>;
  canCloseModalChecks: MutableRefObject<Array<() => boolean>>;
  /** The div for ModalBody to portal into; note this can't be a ref b/c Modal hasn't set the ref at the time ModalBody renders. */
  modalBodyDiv: HTMLDivElement;
  /** The div for ModalFooter to portal into. */
  modalFooterDiv: HTMLDivElement;
  /** Checks when closing SuperDrawer */
  canCloseDrawerChecks: MutableRefObject<Array<() => boolean>>;
  /** Checks when closing SuperDrawer Details */
  canCloseDrawerDetailsChecks: MutableRefObject<Array<Array<() => boolean>>>;
}

/** This is only exported internally, for useModal and useSuperDrawer, it's not a public API. */
export const BeamContext = createContext<BeamContextState>({
  contentStack: new EmptyRef(),
  modalState: new EmptyRef(),
  canCloseModalChecks: new EmptyRef(),
  modalBodyDiv: undefined!,
  modalFooterDiv: undefined!,
  canCloseDrawerChecks: new EmptyRef(),
  canCloseDrawerDetailsChecks: new EmptyRef(),
});

export function BeamProvider({ children }: { children: ReactNode }) {
  // We want the identity of these to be stable, b/c they end up being used as dependencies
  // in both useModal's and useSuperDrawer's return values, which means the end-application's
  // dependencies as well, i.e. things like GridTable rowStyles will memoize on openInDrawer.
  // So we use refs + a tick.
  const [, tick] = useReducer((prev) => prev + 1, 0);
  const modalRef = useRef<ModalProps | undefined>();
  const modalBodyDiv = useMemo(() => document.createElement("div"), []);
  const modalFooterDiv = useMemo(() => document.createElement("div"), []);
  const contentStackRef = useRef<ContentStack[]>([]);
  const canCloseModalChecksRef = useRef<Array<() => boolean>>([]);
  const canCloseDrawerChecksRef = useRef<Array<() => boolean>>([]);
  const canCloseDrawerDetailsChecksRef = useRef<Array<Array<() => boolean>>>([]);

  // We essentially expose the refs, but with our own getters/setters so that we can
  // have the setters call `tick` to re-render this Provider
  const context = useMemo<BeamContextState>(() => {
    return {
      modalState: new PretendRefThatTicks(modalRef, tick),
      contentStack: new PretendRefThatTicks(contentStackRef, tick),
      // We don't need to rerender when these are mutated, so just expose as-is
      modalBodyDiv,
      modalFooterDiv,
      canCloseModalChecks: canCloseModalChecksRef,
      canCloseDrawerChecks: canCloseDrawerChecksRef,
      canCloseDrawerDetailsChecks: canCloseDrawerDetailsChecksRef,
    };
  }, [modalBodyDiv, modalFooterDiv]);

  return (
    <BeamContext.Provider value={{ ...context }}>
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

/** Looks like a ref, but invokes a re-render on set (w/o changing the setter identity). */
class PretendRefThatTicks<T> implements MutableRefObject<T> {
  constructor(private ref: MutableRefObject<T>, private tick: () => void) {}
  get current(): T {
    return this.ref.current;
  }
  set current(value) {
    this.ref.current = value;
    this.tick();
  }
}
