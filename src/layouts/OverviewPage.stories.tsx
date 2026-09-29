import type { Meta } from "@storybook/react-vite";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { LoadingSkeleton } from "src/components/LoadingSkeleton";
import { Css, Tokens } from "src/Css";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar, GridTableLayoutExample, SideNavBrand, sideNavItems } from "src/utils/sbComponents";
import { action } from "storybook/actions";

export default {
  title: "Layouts/Overview Page",
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/**
 * Mixed-content app page: env banner → navbar → side nav → page header → `CenteredLayout size="lg"`.
 * The wide shell (1440px) holds a `ContentHeader`, summary cards, and a table.
 */
export function Default() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        <SideNavLayout sideNav={{ top: <SideNavBrand />, items: sideNavItems() }}>
          <PageHeaderLayout pageHeader={{ title: "Project overview" }}>
            <CenteredLayout size="lg">
              <OverviewBody />
            </CenteredLayout>
          </PageHeaderLayout>
        </SideNavLayout>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

function OverviewBody() {
  return (
    <div css={Css.df.fdc.gap3.pb3.$}>
      <ContentHeader
        title="Overview"
        description="Status and recent activity for this project."
        actions={[{ label: "Export", onClick: action("export clicked"), variant: "secondary" }]}
      />
      <div css={Css.df.fdc.gap3.ifMdAndUp.fdr.$}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <GridTableLayoutExample
        storageKey="layouts-overview-page"
        numNestedRows={1}
        style={{ bordered: true, roundedHeader: true }}
      />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div css={Css.fg1.ba.br12.bc(Tokens.FieldBorderDefault).bgColor(Tokens.SurfaceRaised).p3.$}>
      <LoadingSkeleton rows={3} size="lg" randomizeWidths />
    </div>
  );
}
