import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import type { GridDataRow } from "src/components/Table/components/Row";
import { GridTable } from "src/components/Table/GridTable";
import type { GridColumn } from "src/components/Table/types";
import { simpleHeader, type SimpleHeaderAndData } from "src/components/Table/utils/simpleHelpers";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar, PlaceholderFields } from "src/utils/sbComponents";
import { action } from "storybook/actions";

export default {
  title: "Layouts/Form Page",
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/** Env banner → navbar → page header → `FormSectionLayout`. */
export function Default() {
  return (
    <FormPageChrome title="Trade Partners">
      <FormSectionLayout
        title="Trade Partners"
        description="Assign and manage trade partners for this project."
        actions={[{ label: "Save draft", onClick: action("save draft clicked"), variant: "tertiary" }]}
        initialFields={<PlaceholderFields count={2} />}
        sections={[
          {
            title: "General Contractor",
            description: "The primary contractor responsible for this project.",
            actions: [{ label: "Add", onClick: action("add clicked"), variant: "tertiary" }],
            fields: <PlaceholderFields count={2} />,
          },
          {
            title: "Sub-Contractors",
            description: "Partners assigned to this project.",
            fields: <SubContractorsTable />,
          },
        ]}
      />
    </FormPageChrome>
  );
}

/** Child sections nested under a single form section. */
export function WithNestedSections() {
  return (
    <FormPageChrome title="Trade Partners">
      <FormSectionLayout
        title="Trade Partners"
        description="Assign and manage trade partners for this project."
        sections={[
          {
            title: "Sub-Contractors",
            description: "Assign and manage trade partners for this project.",
            actions: [{ label: "Add", onClick: action("add clicked"), variant: "secondary", size: "sm" }],
            childSections: ["Electrical", "Plumbing", "HVAC"].map((title) => ({
              id: title.toLowerCase(),
              title,
              actions: [{ label: "Add", onClick: action(`add ${title} clicked`), variant: "secondary", size: "sm" }],
              fields: <PlaceholderFields count={2} />,
            })),
          },
        ]}
      />
    </FormPageChrome>
  );
}

/** Auto-save indicator in the page header, driven by `withAutoSave` on the form. */
export function WithAutoSave() {
  return (
    <FormPageChrome title="Trade Partners">
      <FormSectionLayout
        withAutoSave
        title="Trade Partners"
        description="Assign and manage trade partners for this project."
        initialFields={<PlaceholderFields count={2} />}
        sections={[{ title: "General Contractor", fields: <PlaceholderFields count={2} /> }]}
      />
    </FormPageChrome>
  );
}

function SubContractorsTable() {
  type Partner = { name: string; trade: string; status: string };
  type Row = SimpleHeaderAndData<Partner>;
  const columns: GridColumn<Row>[] = [
    { header: "Name", data: ({ name }) => name },
    { header: "Trade", data: ({ trade }) => trade },
    { header: "Status", data: ({ status }) => status },
  ];
  const rows: GridDataRow<Row>[] = [
    simpleHeader,
    { kind: "data", id: "1", data: { name: "Apex Electric", trade: "Electrical", status: "Active" } },
    { kind: "data", id: "2", data: { name: "Summit Plumbing", trade: "Plumbing", status: "Active" } },
    { kind: "data", id: "3", data: { name: "Northwind HVAC", trade: "HVAC", status: "Pending" } },
  ];
  return <GridTable columns={columns} rows={rows} />;
}

function FormPageChrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        <PageHeaderLayout pageHeader={{ title }}>{children}</PageHeaderLayout>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}
