import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { AutoSaveStatus, AutoSaveStatusContext } from "src/components/AutoSaveStatus/AutoSaveStatusProvider";
import type { Breadcrumb } from "src/components/Breadcrumbs";
import { Button } from "src/components/Button";
import { PageHeader } from "src/components/Headers/PageHeader";
import { TabContent } from "src/components/Tabs";
import { testTabs } from "src/components/testData";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  component: PageHeader,
  parameters: {
    type: "figma",
    url: "https://www.figma.com/design/yJcdAYy1rqkxTTNhUQnjjU/H2-2026-Beam-Work?m=dev",
    layout: "fullscreen",
  },
  decorators: [withRouter(), withBeamDecorator],
} as Meta;

export function NoRightSlot() {
  return <PageHeader title="Test Title" />;
}

export function WithRightSlot() {
  return (
    <PageHeader
      title="Test Title"
      rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
    />
  );
}

export function AutoSaveSaving() {
  return (
    <AutoSaveStatusContext.Provider
      value={{
        status: AutoSaveStatus.SAVING,
        resetStatus() {},
        errors: [],
        resolveAutoSave() {},
        triggerAutoSave() {},
      }}
    >
      <PageHeader
        title="Test Title"
        actions={[
          { label: "Upload", variant: "primary", onClick: action("upload") },
          { kind: "default", variant: "secondary", icon: "refresh", label: "Refresh", onClick: action("refresh") },
        ]}
      />
    </AutoSaveStatusContext.Provider>
  );
}

/** `keepVisible` actions stay in the bottom slot at `sm`; the others still collapse into a overflow menu. */
export const WithKeepVisible = newStory(
  () => {
    const [selected, setSelected] = useState(testTabs[0].value);
    return (
      <PageHeader
        title="Bid Packages"
        breadcrumbs={{
          breadcrumbs: [
            { label: "Los Angeles", href: "" },
            { label: "Altadena", href: "" },
          ],
        }}
        actions={[
          {
            kind: "menu",
            keepVisible: true,
            trigger: { label: "Plan Cycle · In Progress", variant: "secondary", colorScheme: "info" },
            items: [
              { label: "Mark Complete", onClick: action("complete") },
              { label: "Reset Cycle", onClick: action("reset"), destructive: true },
            ],
          },
          { label: "Upload", variant: "primary", onClick: action("upload") },
          { kind: "default", variant: "secondary", icon: "refresh", label: "Refresh", onClick: action("refresh") },
        ]}
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
    );
  },
  { parameters: { chromatic: { modes: viewportModes("desktop", "mobile1") } } },
);

/** Same as `WithKeepVisible`, but without tabs — Chromatic should catch missing bottom spacing above the header border. */
export const WithKeepVisibleNoTabs = newStory(
  () => (
    <PageHeader
      title="Bid Packages"
      breadcrumbs={{
        breadcrumbs: [
          { label: "Los Angeles", href: "" },
          { label: "Altadena", href: "" },
        ],
      }}
      actions={[
        {
          kind: "menu",
          keepVisible: true,
          trigger: { label: "Plan Cycle · In Progress", variant: "secondary", colorScheme: "info" },
          items: [
            { label: "Mark Complete", onClick: action("complete") },
            { label: "Reset Cycle", onClick: action("reset"), destructive: true },
          ],
        },
        { label: "Upload", variant: "primary", onClick: action("upload") },
        { kind: "default", variant: "secondary", icon: "refresh", label: "Refresh", onClick: action("refresh") },
      ]}
    />
  ),
  { parameters: { chromatic: { modes: viewportModes("desktop", "mobile1") } } },
);

/** Two or more `actions` render as buttons on desktop and collapse into a overflow menu at `sm`. */
export const WithActions = newStory(
  () => (
    <PageHeader
      title="Test Title"
      actions={[
        { label: "Upload", variant: "primary", onClick: action("upload") },
        { kind: "default", variant: "secondary", icon: "refresh", label: "Refresh", onClick: action("refresh") },
      ]}
    />
  ),
  { parameters: { chromatic: { modes: viewportModes("desktop", "mobile1") } } },
);

export function WithTabs() {
  const [selected, setSelected] = useState(testTabs[0].value);

  return (
    <>
      <PageHeader
        title="Test Title"
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
      <TabContent tabs={testTabs} selected={selected} />
    </>
  );
}

export function WithBreadcrumbs() {
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
    { label: "Test 3", href: "" },
  ];

  return (
    <PageHeader
      title="Test Title"
      breadcrumbs={{
        breadcrumbs: breadcrumbs,
      }}
    />
  );
}

export function WithRightSlotAndTabs() {
  const [selected, setSelected] = useState(testTabs[0].value);

  return (
    <>
      <PageHeader
        title="Test Title"
        rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
      <TabContent tabs={testTabs} selected={selected} />
    </>
  );
}

export function WithRightSlotAndTabsAndBreadcrumbs() {
  const [selected, setSelected] = useState(testTabs[0].value);
  const breadcrumbs: Breadcrumb[] = [
    { label: "Test 1", href: "" },
    { label: "Test 2", href: "" },
    { label: "Test 3", href: "" },
  ];

  return (
    <>
      <PageHeader
        title="Test Title"
        breadcrumbs={{ breadcrumbs }}
        rightSlot={<Button label="Test Action" variant="primary" onClick={action("clicked")} />}
        tabs={{
          tabs: testTabs,
          selected,
          onChange: setSelected,
        }}
      />
      <TabContent tabs={testTabs} selected={selected} />
    </>
  );
}
