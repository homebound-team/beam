import { ReactElement, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { CheckFn } from "src/types";
import { maybeCall } from "src/utils";
import { Modal, ModalApi, ModalProps } from "./Modal";
import { useModalContext } from "./ModalContext";
import { useModalInstance } from "./ModalInstanceContext";

export interface UseModalHook {
  openModal: (props: ModalProps) => void;
  closeModal: VoidFunction;
  addCanClose: (canClose: CheckFn) => void;
  setSize: (size: ModalProps["size"]) => void;
  inModal: boolean;
  /**
   * Must be rendered in the same component that called `useModal()`.
   * Renders nothing visible when closed; when open, mounts `<Modal />` under this call site
   * (React context) and paints via OverlayContainer under Beam's OverlayProvider.
   */
  portal: ReactElement | null;
}

type UseModalHostOptions = {
  /**
   * When true (default for public useModal), openModal no-ops with a dev error if `portal` is not mounted.
   * InternalModalHost sets this false because it always renders its own portal.
   */
  requirePortal?: boolean;
};

/**
 * Shared host logic for call-site modals and the Beam-internal SuperDrawer confirm host.
 */
export type UseModalHostResult = UseModalHook & {
  /** Closes without canClose checks — used by coordinator replace + InternalModalHost.forceClose. */
  closeModalSkippingChecks: VoidFunction;
};

export function useModalHost(options: UseModalHostOptions = {}): UseModalHostResult {
  const { requirePortal = true } = options;
  const { modalCoordinator } = useBeamContext();
  const { inModal } = useModalContext();
  const instanceId = useId();

  const [modalProps, setModalProps] = useState<ModalProps | undefined>();
  const modalCanCloseChecks = useRef<CheckFn[]>([]);
  const lastCanClose = useRef<CheckFn | undefined>();
  const api = useRef<ModalApi>();
  const portalMountedRef = useRef(false);
  const modalPropsRef = useRef(modalProps);
  modalPropsRef.current = modalProps;

  const closeModal = useCallback(() => {
    for (const canCloseModal of modalCanCloseChecks.current) {
      if (!canCloseModal()) {
        return;
      }
    }
    maybeCall(modalPropsRef.current?.onClose);
    setModalProps(undefined);
    modalCanCloseChecks.current = [];
    lastCanClose.current = undefined;
    modalCoordinator.release(instanceId);
  }, [instanceId, modalCoordinator]);

  /** Closes without canClose checks — used by coordinator replace + InternalModalHost.forceClose. */
  const closeModalSkippingChecks = useCallback(() => {
    maybeCall(modalPropsRef.current?.onClose);
    setModalProps(undefined);
    modalCanCloseChecks.current = [];
    lastCanClose.current = undefined;
    modalCoordinator.release(instanceId);
  }, [instanceId, modalCoordinator]);

  // Keep forceClose identity stable for the coordinator registration
  const forceClose = closeModalSkippingChecks;

  const openModal = useCallback(
    (props: ModalProps) => {
      if (requirePortal && !portalMountedRef.current) {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "[Beam] useModal().openModal() was called but `modal.portal` is not rendered in this component. " +
              "Render `{modal.portal}` in the same component that calls useModal().",
          );
        }
        return;
      }
      modalCoordinator.claim({ id: instanceId, forceClose });
      setModalProps({ ...props, api });
    },
    [forceClose, instanceId, modalCoordinator, requirePortal],
  );

  const addCanClose = useCallback((canClose: CheckFn) => {
    modalCanCloseChecks.current = [
      ...modalCanCloseChecks.current.filter((c) => c !== lastCanClose.current),
      canClose,
    ];
    lastCanClose.current = canClose;
  }, []);

  const setSize = useCallback((size: ModalProps["size"]) => {
    if (modalPropsRef.current?.api?.current) {
      modalPropsRef.current.api.current.setSize(size);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Caller unmounted while open — unregister cleanly.
      if (modalPropsRef.current) {
        maybeCall(modalPropsRef.current.onClose);
        modalCoordinator.release(instanceId);
      }
    };
  }, [instanceId, modalCoordinator]);

  const onPortalMount = useCallback(() => {
    portalMountedRef.current = true;
  }, []);
  const onPortalUnmount = useCallback(() => {
    portalMountedRef.current = false;
  }, []);

  const portal = (
    <ModalPortalOutlet
      key={instanceId}
      modalProps={modalProps}
      closeModal={closeModal}
      addCanClose={addCanClose}
      setSize={setSize}
      onMount={onPortalMount}
      onUnmount={onPortalUnmount}
    />
  );

  return useMemo(
    () => ({
      openModal,
      closeModal,
      closeModalSkippingChecks,
      addCanClose,
      setSize,
      inModal,
      portal,
    }),
    // portal identity changes when modalProps changes — intentional re-render of outlet
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openModal, closeModal, closeModalSkippingChecks, addCanClose, setSize, inModal, modalProps],
  );
}

function ModalPortalOutlet(props: {
  modalProps: ModalProps | undefined;
  closeModal: VoidFunction;
  addCanClose: (canClose: CheckFn) => void;
  setSize: (size: ModalProps["size"]) => void;
  onMount: () => void;
  onUnmount: () => void;
}) {
  const { modalProps, closeModal, addCanClose, setSize, onMount, onUnmount } = props;

  useLayoutEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);

  if (!modalProps) {
    return null;
  }

  return (
    <Modal
      {...modalProps}
      hostCloseModal={closeModal}
      hostAddCanClose={addCanClose}
      hostSetSize={setSize}
    />
  );
}

/**
 * Public modal API. Each call creates a local host; render `{modal.portal}` in the same component.
 * When called under an open Modal, returns that instance's close/addCanClose/setSize (portal is null).
 */
export function useModal(): UseModalHook {
  const parentInstance = useModalInstance();
  const { inModal } = useModalContext();

  // Always call useModalHost to satisfy the rules of hooks; ignore it when nested under a Modal.
  const host = useModalHost({ requirePortal: true });

  if (parentInstance) {
    return {
      openModal: () => {
        if (process.env.NODE_ENV !== "production") {
          console.error(
            "[Beam] openModal() from inside a Modal is not supported via the nested useModal() binding. " +
              "Call useModal() in a parent component and render `{modal.portal}` there.",
          );
        }
      },
      closeModal: parentInstance.closeModal,
      addCanClose: parentInstance.addCanClose,
      setSize: parentInstance.setSize,
      inModal: true,
      portal: null,
    };
  }

  if (inModal) {
    const { closeModalSkippingChecks: _, ...publicHost } = host;
    return { ...publicHost, inModal: true };
  }

  const { closeModalSkippingChecks: _, ...publicHost } = host;
  return publicHost;
}
