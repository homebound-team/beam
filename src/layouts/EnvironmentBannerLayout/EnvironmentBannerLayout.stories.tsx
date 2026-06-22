import { Meta } from "@storybook/react-vite";
import { HomeboundLogo } from "src/components/HomeboundLogo";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { GridTableLayoutExample } from "src/utils/sbComponents";

export default {
  component: EnvironmentBannerLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} as Meta;

/** Banner hidden — height var is 0; chrome offsets match a tree without a banner. */
export function Hidden() {
  return (
    <EnvironmentBannerLayout>
      <NavbarLayout
        navbar={{
          brand: <HomeboundLogo fill={Tokens.OnSurface} width={5} />,
          items: [{ label: "Dashboard", onClick: () => {}, active: true }],
        }}
      >
        <div css={Css.bgGray50.p3.$}>Body without a displayed banner.</div>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

/** Full composition with a displayed QA environment banner above auto-hiding navbar + page header. */
export function Composed() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa", impersonating: createImpersonatedUser() }}>
      <NavbarLayout
        navbar={{
          brand: <HomeboundLogo fill={Tokens.OnSurface} width={5} />,
          items: [
            { label: "Dashboard", onClick: () => {}, active: true },
            { label: "Projects", onClick: () => {} },
          ],
        }}
      >
        <SideNavLayout
          sideNav={{
            items: [
              {
                section: true,
                label: "Main",
                items: [{ label: "Dashboard", icon: "kanban", onClick: "/", active: true }],
              },
            ],
          }}
        >
          <PageHeaderLayout pageHeader={{ title: "Page header" }}>
            <GridTableLayoutExample storageKey="environment-banner-layout-composed" />
          </PageHeaderLayout>
        </SideNavLayout>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

function createImpersonatedUser() {
  return { name: "Andrea Eppy" };
}
