import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import type { PageBannerProps } from "src/components/StatusBanner/StatusBanner";
import { TabContent, type TabWithContent } from "src/components/Tabs";
import { Css, Tokens } from "src/Css";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { usePageBanner } from "src/layouts/PageBanner/usePageBanner";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { noop } from "src/utils/helpers";
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

/** Stay-pinned page banner under the header. It stays put when the page header auto-hides. */
export function WithBanner() {
  return (
    <TablePageChrome
      withSideNav
      banner={{
        type: "update",
        title: "Calculating Updated Costs",
        description: "Costs shown may be out of date.",
        secondaryAction: { label: "View Details", onClick: noop },
      }}
    >
      <GridTableLayoutExample storageKey="layouts-table-page-banner" withRightPane />
    </TablePageChrome>
  );
}

/** A tab pins its own banner with `usePageBanner`; switching tabs clears it. */
export function WithTabBanner() {
  const [selected, setSelected] = useState<PageTab>("lineItems");
  const tabs = useMemo(() => pageTabs({ lineItemsBanner: true }), []);

  return (
    <TablePageChrome withSideNav tabs={{ tabs, selected, onChange: setSelected }}>
      <TabContent tabs={tabs} selected={selected} />
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
  banner,
  children,
}: {
  withSideNav?: boolean;
  tabs?: { tabs: TabWithContent<PageTab>[]; selected: PageTab; onChange: (value: PageTab) => void };
  banner?: PageBannerProps;
  children: ReactNode;
}) {
  const body = (
    <PageHeaderLayout
      pageHeader={{ title: "Projects", rightSlot: <OpenRightPaneButton title="Row detail" />, ...(tabs && { tabs }) }}
      banner={banner}
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

function pageTabs({ lineItemsBanner = false } = {}): TabWithContent<PageTab>[] {
  return [
    {
      name: "Line items",
      value: "lineItems",
      render: () =>
        lineItemsBanner ? (
          <LineItemsTabWithBanner />
        ) : (
          <GridTableLayoutExample storageKey="layouts-table-page-tabs" withRightPane />
        ),
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

function LineItemsTabWithBanner() {
  // Stands in for a tab's query result deciding whether it needs a banner.
  const [costsStale, setCostsStale] = useState(true);
  const banner = useMemo<PageBannerProps | undefined>(
    () =>
      costsStale
        ? {
            type: "update",
            title: "Updated Costs Ready",
            description: "Updated calculations are ready for 632 configurations.",
            secondaryAction: { label: "View Details", onClick: noop },
            primaryAction: { label: "Update Costs", onClick: () => setCostsStale(false) },
          }
        : undefined,
    [costsStale],
  );
  usePageBanner(banner);
  return <GridTableLayoutExample storageKey="layouts-table-page-tab-banner" withRightPane />;
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
