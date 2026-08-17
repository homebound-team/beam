import { ReactNode, useEffect } from "react";
import { SuperDrawerHeader } from "src/components/SuperDrawer/components/SuperDrawerHeader";
import { render } from "src/utils/rtl";
import { SuperDrawerContent, useSuperDrawer } from "./index";

describe("SuperDrawerContent", () => {
  it("renders a banner above the content", async () => {
    // Given a drawer whose content declares a banner
    const r = await render(<TestDrawerContent banner={<div data-testid="banner">Banner</div>} />);
    // Then the banner renders ahead of the children, sharing their scroll container.
    // The negative margins that bleed it past the padding aren't assertable here —
    // they compile to `calc(var(--t-spacing) * -3)`, which jsdom won't resolve.
    expect(r.banner).toBeTruthy();
    expect(r.banner.parentElement!.nextElementSibling).toBe(r.drawerBody);
  });

  it("omits the banner wrapper when no banner is given", async () => {
    // Given a drawer whose content has no banner
    const r = await render(<TestDrawerContent />);
    // Then nothing is emitted above the children
    expect(r.query.banner).not.toBeInTheDocument();
    expect(r.drawerBody.parentElement!.firstElementChild).toBe(r.drawerBody);
  });
});

function TestDrawerContent(props: { banner?: ReactNode }) {
  const context = useSuperDrawer();
  useEffect(
    () => {
      context.openInDrawer({
        content: (
          <>
            <SuperDrawerHeader title="Title" />
            <SuperDrawerContent banner={props.banner}>
              <h2 data-testid="drawerBody">SuperDrawer Content</h2>
            </SuperDrawerContent>
          </>
        ),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return <h1>Page Content</h1>;
}
