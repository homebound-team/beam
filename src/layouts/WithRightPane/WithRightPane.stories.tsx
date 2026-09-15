import type { Meta } from "@storybook/react-vite";
import { useEffect, type ReactNode } from "react";
import { Button } from "src/components/Button";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { Css, Tokens } from "src/Css";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { SideNavLayout } from "src/layouts/SideNavLayout/SideNavLayout";
import { FocusedFormLayout } from "src/layouts/Workflow/FocusedFormLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import {
  createNavbar,
  createRightPaneFormSections,
  GridTableLayoutExample,
  RightPaneCenteredPlaceholderBody,
  sideNavItems,
} from "src/utils/sbComponents";
import { action } from "storybook/actions";

/** Wait for table/layout measure before opening so column widths can settle. */
const openRightPaneDelayMs = 800;

export default {
  title: "Layouts/With Right Pane",
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 1100, modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/** `GridTableLayout withRightPane` under env banner + navbar + side nav + page header. */
export function Table() {
  return (
    <AppChrome title="Projects" paneTitle="Row detail">
      <OpenRightPaneOnMount title="Row detail" />
      <GridTableLayoutExample storageKey="with-right-pane-table" withRightPane />
    </AppChrome>
  );
}

/** `CenteredLayout size="lg"` under env banner + navbar + side nav + page header. */
export function ContentLg() {
  return (
    <AppChrome title="Dashboard" paneTitle="Dashboard detail">
      <CenteredLayout size="lg" withRightPane>
        <OpenRightPaneOnMount title="Dashboard detail" />
        <RightPaneCenteredPlaceholderBody />
      </CenteredLayout>
    </AppChrome>
  );
}

/** `FormSectionLayout` (`sm` shell) with JumpLinks under FocusedForm chrome. */
export function ContentSm() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        completeLabel="Create"
        onComplete={action("complete clicked")}
      >
        <ContentSmForm />
        <OpenRightPaneOnMount title="Package detail" />
      </FocusedFormLayout>
    </EnvironmentBannerLayout>
  );
}

function ContentSmForm() {
  const { openRightPane } = useRightPaneActions();
  return (
    <FormSectionLayout
      withJumpLinks
      withRightPane
      title="Link Design Package"
      description="Connect this package to a market and give it a name."
      actions={[
        {
          label: "Open right pane",
          variant: "secondary",
          onClick: () => openRightPane(rightPaneContent("Package detail")),
        },
      ]}
      sections={createRightPaneFormSections()}
    />
  );
}

function AppChrome({ title, paneTitle, children }: { title: string; paneTitle: string; children: ReactNode }) {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        <SideNavLayout sideNav={{ items: sideNavItems() }}>
          <PageHeaderLayout pageHeader={{ title, rightSlot: <OpenRightPaneButton title={paneTitle} /> }}>
            {children}
          </PageHeaderLayout>
        </SideNavLayout>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

function OpenRightPaneButton({ title }: { title: string }) {
  const { openRightPane } = useRightPaneActions();
  return <Button label="Open right pane" variant="secondary" onClick={() => openRightPane(rightPaneContent(title))} />;
}

function OpenRightPaneOnMount({ title }: { title: string }) {
  const { openRightPane } = useRightPaneActions();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      openRightPane(rightPaneContent(title));
    }, openRightPaneDelayMs);
    return () => window.clearTimeout(timer);
  }, [openRightPane, title]);
  return null;
}

function rightPaneContent(title: string) {
  return {
    content: (
      <RightPanePanel title={title}>
        <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>
          Desktop overlay. On `md+` the content column sits beside the pane; if the remaining viewport is under 480px
          the document grows so content stays reachable. JumpLinks are outside that 480px floor.
        </p>
      </RightPanePanel>
    ),
  };
}
