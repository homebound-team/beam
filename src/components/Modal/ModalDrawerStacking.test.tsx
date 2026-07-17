import { useEffect } from "react";
import { useModal } from "src/components/Modal/useModal";
import { useSuperDrawer } from "src/components/SuperDrawer";
import { render } from "src/utils/rtl";
import { zIndices } from "src/utils/zIndices";

describe("Modal + SuperDrawer stacking", () => {
  it("stacks modal above an open drawer", async () => {
    function TestApp() {
      const { openInDrawer } = useSuperDrawer();
      const { openModal, portal } = useModal();
      useEffect(() => {
        openInDrawer({ content: <div data-testid="drawerBody">Drawer</div> });
        openModal({ content: <div data-testid="modalBody">Modal</div> });
      }, [openInDrawer, openModal]);
      return <div data-testid="app">{portal}</div>;
    }

    const r = await render(<TestApp />);
    expect(r.drawerBody).toBeTruthy();
    expect(r.modalBody).toBeTruthy();

    const underlay = r.getByTestId("modal_underlay");
    expect(underlay).toHaveStyle({ zIndex: String(zIndices.modalUnderlay) });

    // Modal underlay sits above the drawer scrim in the shared z-index scale
    expect(zIndices.modalUnderlay).toBeGreaterThan(zIndices.superDrawerScrim);
  });
});
