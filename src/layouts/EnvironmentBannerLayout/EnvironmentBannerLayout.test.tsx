import { environmentBannerSizePx } from "src/components/EnvironmentBanner/EnvironmentBanner";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { beamEnvironmentBannerLayoutHeightVar } from "src/layouts/layoutVars";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { render } from "src/utils/rtl";

describe("EnvironmentBannerLayout", () => {
  it("renders children without a banner when environmentBanner is omitted", async () => {
    // Given a layout with no banner props
    const r = await render(
      <EnvironmentBannerLayout>
        <span>Page content</span>
      </EnvironmentBannerLayout>,
    );

    // Then children render and the banner is absent with zero height
    expect(r.environmentBannerLayout).toHaveTextContent("Page content");
    expect(r.query.environmentBannerLayout_environmentBanner).toBeNull();
    expect(r.environmentBannerLayout.style.getPropertyValue(beamEnvironmentBannerLayoutHeightVar)).toBe("0px");
  });

  it("renders the banner and publishes height for dev", async () => {
    // Given a layout with dev banner props
    const r = await render(
      <EnvironmentBannerLayout environmentBanner={{ env: "dev" }}>
        <span>Page content</span>
      </EnvironmentBannerLayout>,
    );

    // Then the banner and children render with the published height
    expect(r.environmentBannerLayout_environmentBanner).toBeInTheDocument();
    expect(r.environmentBannerLayout_environmentBanner_badge).toHaveTextContent("DEV");
    expect(r.environmentBannerLayout.style.getPropertyValue(beamEnvironmentBannerLayoutHeightVar)).toBe(
      `${environmentBannerSizePx}px`,
    );
  });

  it("publishes zero height for prod without impersonation", async () => {
    // Given a layout with prod env props and no impersonation
    const r = await render(
      <EnvironmentBannerLayout environmentBanner={{ env: "prod" }}>
        <span>Page content</span>
      </EnvironmentBannerLayout>,
    );

    // Then the banner is absent and height is zero
    expect(r.query.environmentBannerLayout_environmentBanner).toBeNull();
    expect(r.environmentBannerLayout.style.getPropertyValue(beamEnvironmentBannerLayoutHeightVar)).toBe("0px");
  });

  it("renders the banner and publishes height for prod while impersonating", async () => {
    // Given a layout with prod env props while impersonating
    const r = await render(
      <EnvironmentBannerLayout environmentBanner={{ env: "prod", impersonating: { name: "Andrea Eppy" } }}>
        <span>Page content</span>
      </EnvironmentBannerLayout>,
    );

    // Then the banner and children render with the published height
    expect(r.environmentBannerLayout_environmentBanner).toBeInTheDocument();
    expect(r.environmentBannerLayout_environmentBanner_badge).toHaveTextContent("PROD");
    expect(r.environmentBannerLayout.style.getPropertyValue(beamEnvironmentBannerLayoutHeightVar)).toBe(
      `${environmentBannerSizePx}px`,
    );
  });

  it("wraps the banner in horizontally fixed chrome", async () => {
    // Given a displayed dev banner in a document-scroll layout
    const r = await render(
      <EnvironmentBannerLayout environmentBanner={{ env: "dev" }}>
        <span>Page content</span>
      </EnvironmentBannerLayout>,
    );

    // Then the layout-owned shell pins for document-scroll
    expect(r.environmentBannerLayout_bannerSticky).toHaveStyle({ position: "fixed" });
    expect(r.environmentBannerLayout_environmentBanner).toBeInTheDocument();
  });

  it("wraps nested layouts so the banner publishes height for chrome offsets", async () => {
    // Given a navbar nested inside an environment banner layout with a displayed banner
    const r = await render(
      <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
        <NavbarLayout
          navbar={{
            brand: "Brand",
            items: [{ label: "Home", onClick: () => {}, active: true }],
          }}
        >
          <span>Body</span>
        </NavbarLayout>
      </EnvironmentBannerLayout>,
    );

    // Then the layout root publishes banner height for descendant chrome
    expect(r.environmentBannerLayout.style.getPropertyValue(beamEnvironmentBannerLayoutHeightVar)).toBe(
      `${environmentBannerSizePx}px`,
    );
    expect(r.navbarLayout).toBeInTheDocument();
  });
});
