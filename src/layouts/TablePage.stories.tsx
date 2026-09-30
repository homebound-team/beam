import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { TabContent, type TabWithContent } from "src/components/Tabs";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar, GridTableLayoutExample, SideNavBrand, sideNavItems } from "src/utils/sbComponents";

export default {
  title: "Layouts/Table Page",
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/**
 * Env banner → navbar → side nav → page header → `GridTableLayout`.
 * Click a row or **Open right pane** to open the document-scroll pane.
 */
export function WithSideNav() {
  return (
    <TablePageChrome withSideNav>
      <GridTableLayoutExample storageKey="layouts-table-page-side-nav" withRightPane />
    </TablePageChrome>
  );
}

/** Same table page without a side nav — the page header spans from the viewport left edge. */
export function WithoutSideNav() {
  return (
    <TablePageChrome>
      <GridTableLayoutExample storageKey="layouts-table-page" withRightPane />
    </TablePageChrome>
  );
}

/** Same chrome, with header tabs. The table's actions own the top gap; Overview uses the tab panel's. */
export function WithTabs() {
  const [selected, setSelected] = useState<PageTab>("lineItems");
  const tabs = useMemo(() => pageTabs(), []);

  return (
    <TablePageChrome withSideNav tabs={{ tabs, selected, onChange: setSelected }}>
      <TabContent tabs={tabs} selected={selected} />
    </TablePageChrome>
  );
}

function TablePageChrome({
  withSideNav,
  tabs,
  children,
}: {
  withSideNav?: boolean;
  tabs?: { tabs: TabWithContent<PageTab>[]; selected: PageTab; onChange: (value: PageTab) => void };
  children: ReactNode;
}) {
  const body = (
    <PageHeaderLayout
      pageHeader={{ title: "Projects", rightSlot: <OpenRightPaneButton title="Row detail" />, ...(tabs && { tabs }) }}
    >
      {children}
    </PageHeaderLayout>
  );
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        {withSideNav ? (
          <SideNavLayout sideNav={{ top: <SideNavBrand />, items: sideNavItems() }}>{body}</SideNavLayout>
        ) : (
          body
        )}
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

type PageTab = "lineItems" | "overview";

function pageTabs(): TabWithContent<PageTab>[] {
  return [
    {
      name: "Line items",
      value: "lineItems",
      render: () => <GridTableLayoutExample storageKey="layouts-table-page-tabs" />,
    },
    {
      name: "Overview",
      value: "overview",
      render: () => (
        <div css={{ ...pageContentPaddingX, ...Css.pb2.$ }}>
          <p>Overview content sits below the tabs with the tab panel's own top gap.</p>
        </div>
      ),
    },
  ];
}

function OpenRightPaneButton({ title }: { title: string }) {
  const { openRightPane } = useRightPaneActions();
  return (
    <Button
      label="Open right pane"
      variant="secondary"
      onClick={() =>
        openRightPane({
          content: (
            <RightPanePanel title={title}>
              <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>
                Document-scroll pane. Click a table row or this action to open it; close from the pane header.
              </p>
            </RightPanePanel>
          ),
        })
      }
    />
  );
}
