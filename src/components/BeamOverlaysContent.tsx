import { useBeamContext } from "src/components/BeamContext";
import { Modal } from "src/components/Modal/Modal";
import { SuperDrawer } from "src/components/SuperDrawer/SuperDrawer";

/** Renders the global Modal and SuperDrawer; used by {@link BeamOverlays} and BeamProvider fallback. */
export function BeamOverlaysContent() {
  const { modalState } = useBeamContext();
  return (
    <>
      {modalState.current && <Modal {...modalState.current} />}
      <SuperDrawer />
    </>
  );
}
