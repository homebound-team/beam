import { useEffect } from "react";
import { BeamOverlaysContent } from "src/components/BeamOverlaysContent";
import { useOverlayHostContext } from "src/components/OverlayHostContext";

/**
 * Mount point for Beam's global Modal and SuperDrawer overlays.
 * Full setup: [`docs/overlays.md`](../../docs/overlays.md).
 */
export function BeamOverlays() {
  const { registerOverlayHost, unregisterOverlayHost } = useOverlayHostContext();

  useEffect(() => {
    registerOverlayHost();
    return unregisterOverlayHost;
  }, [registerOverlayHost, unregisterOverlayHost]);

  return <BeamOverlaysContent />;
}
