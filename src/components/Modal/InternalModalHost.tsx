import { useLayoutEffect } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { useModalHost } from "./useModal";

/**
 * Always-mounted portal host for Beam-internal modals (e.g. SuperDrawer ConfirmCloseModal).
 * Lives under OverlayProvider so OverlayContainer paint stays correct. Not a fallback for app useModal().
 */
export function InternalModalHost() {
  const { internalModalApi } = useBeamContext();
  const host = useModalHost({ requirePortal: false });

  useLayoutEffect(() => {
    internalModalApi.current = {
      openModal: host.openModal,
      forceClose: host.closeModalSkippingChecks,
    };
    return () => {
      internalModalApi.current = undefined;
    };
  }, [host.closeModalSkippingChecks, host.openModal, internalModalApi]);

  return host.portal;
}
