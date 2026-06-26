import { useEffect } from "react";
import { BeamProvider } from "src/components/BeamContext";
import { BeamOverlays } from "src/components/BeamOverlays";
import { ButtonMenu } from "src/components/ButtonMenu";
import { SuperDrawerContent } from "src/components/SuperDrawer";
import { SuperDrawerHeader } from "src/components/SuperDrawer/components/SuperDrawerHeader";
import { useSuperDrawer } from "src/components/SuperDrawer/useSuperDrawer";
import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";

describe("SuperDrawer nested overlays", () => {
  it("opens a ButtonMenu inside SuperDrawer via BeamProvider fallback", async () => {
    // Given a SuperDrawer with a menu trigger, using BeamProvider fallback overlays
    const r = await render(
      <BeamProvider>
        <DrawerWithMenuApp />
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then the drawer is open
    expect(r.superDrawer).toBeTruthy();

    // When opening the menu inside the drawer
    click(r.drawerMenu);

    // Then menu items render above the drawer scrim
    expect(r.drawerMenu_optionA).toBeInTheDocument();

    // When selecting an item
    click(r.drawerMenu_optionA);

    // Then the menu closes
    expect(r.query.drawerMenu_optionA).toBeNull();
  });

  it("opens a ButtonMenu inside SuperDrawer via BeamOverlays", async () => {
    // Given a SuperDrawer with a menu trigger, using an explicit BeamOverlays host
    const r = await render(
      <BeamProvider>
        <DrawerWithMenuApp />
        <BeamOverlays />
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then the drawer is open
    expect(r.superDrawer).toBeTruthy();

    // When opening the menu inside the drawer
    click(r.drawerMenu);

    // Then menu items render above the drawer scrim
    expect(r.drawerMenu_optionA).toBeInTheDocument();

    // When selecting an item
    click(r.drawerMenu_optionA);

    // Then the menu closes
    expect(r.query.drawerMenu_optionA).toBeNull();
  });
});

function DrawerWithMenuApp() {
  const { openInDrawer } = useSuperDrawer();

  useEffect(() => {
    openInDrawer({
      content: (
        <>
          <SuperDrawerHeader title="Drawer with menu" />
          <SuperDrawerContent>
            <ButtonMenu
              data-testid="drawerMenu"
              trigger={{ label: "Actions" }}
              items={[
                { label: "Option A", onClick: noop },
                { label: "Option B", onClick: noop },
              ]}
            />
          </SuperDrawerContent>
        </>
      ),
    });
  }, [openInDrawer]);

  return null;
}
