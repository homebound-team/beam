import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Guards the main-style SuperDrawer host: sibling under ToastProvider, outside OverlayProvider.
 * Call-site modals + InternalModalHost stay under OverlayProvider.
 */
describe("BeamProvider overlay tree", () => {
  it("keeps SuperDrawer outside OverlayProvider (main-style host)", () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "BeamContext.tsx"), "utf8");
    const overlayClose = src.indexOf("</OverlayProvider>");
    const internalHost = src.indexOf("<InternalModalHost");
    const superDrawer = src.indexOf("<SuperDrawer");

    expect(overlayClose).toBeGreaterThan(-1);
    expect(internalHost).toBeGreaterThan(-1);
    expect(superDrawer).toBeGreaterThan(-1);

    // InternalModalHost must stay under OverlayProvider for OverlayContainer paint
    expect(internalHost).toBeLessThan(overlayClose);
    // SuperDrawer must remain a ToastProvider sibling outside OverlayProvider (as on main)
    expect(superDrawer).toBeGreaterThan(overlayClose);
  });
});
