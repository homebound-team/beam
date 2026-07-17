/**
 * Coordinates Beam modals so only one is active at a time and SuperDrawer can force-close.
 * Content still mounts under each call-site `useModal().portal`; this does not own the React tree.
 */
export type ModalCoordinatorRegistration = {
  id: string;
  /** Closes without running canClose checks (used when replacing or SuperDrawer clears). */
  forceClose: () => void;
};

export type ModalCoordinator = {
  /** Registers a newly opened modal; force-closes any previous active modal. */
  claim: (registration: ModalCoordinatorRegistration) => void;
  /** Clears the active registration if it still matches `id`. */
  release: (id: string) => void;
  /** Force-closes the active modal, if any. */
  forceCloseActive: () => void;
};

export function createModalCoordinator(): ModalCoordinator {
  let active: ModalCoordinatorRegistration | undefined;

  return {
    claim(registration) {
      if (active && active.id !== registration.id) {
        active.forceClose();
      }
      active = registration;
    },
    release(id) {
      if (active?.id === id) {
        active = undefined;
      }
    },
    forceCloseActive() {
      if (!active) return;
      const current = active;
      active = undefined;
      current.forceClose();
    },
  };
}
