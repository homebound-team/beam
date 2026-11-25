import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { TextAreaField } from "src/inputs/TextAreaField";
import { TextField } from "src/inputs/TextField";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FieldLayout } from "src/layouts/Forms/FieldLayout";
import { FieldRow, FieldRowItem } from "src/layouts/Forms/FieldRow";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { NavbarLayout } from "src/layouts/NavbarLayout/NavbarLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout/PageHeaderLayout";
import { FocusedFormLayout } from "src/layouts/Workflow/FocusedFormLayout";
import { noop } from "src/utils/helpers";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createNavbar } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { userEvent, waitFor, within } from "storybook/test";

export default {
  title: "Layouts/Forms/Field Layout",
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop") },
  },
} satisfies Meta;

/** Env banner → navbar → page header → `FormSectionLayout`. The 720px form column shows up to 4 across. */
export function FormPage() {
  return (
    <PageChrome>
      <FormSectionLayout
        title="Create Contact"
        description="For billing signatories, include their business address."
        sections={createFieldLayoutSections()}
      />
    </PageChrome>
  );
}

/** Env banner → `FocusedFormLayout` → `FormSectionLayout` with auto-save and a section of child sections, plus the page fields. */
export function Workflow() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <FocusedFormLayout
        title="Create Contact"
        onCancel={action("cancel clicked")}
        onComplete={action("complete clicked")}
      >
        <FormSectionLayout
          withJumpLinks
          withAutoSave
          title="Contact"
          description="For billing signatories, include their business address."
          sections={[...createFieldLayoutSections(), createSignatoriesSection()]}
        />
      </FocusedFormLayout>
    </EnvironmentBannerLayout>
  );
}

/** A form in the 448px right pane. Its 400px body shows 2 columns, and a span of 2 or more is a full row. */
export const RightPane = newStory(
  () => (
    <PageChrome>
      <RightPaneForm />
    </PageChrome>
  ),
  {
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);
      await waitFor(async () => {
        await userEvent.click(canvas.getByText("Edit address"));
      });
    },
  },
);

function PageChrome({ children }: { children: ReactNode }) {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <NavbarLayout navbar={createNavbar()}>
        <PageHeaderLayout pageHeader={{ title: "Create Contact" }}>{children}</PageHeaderLayout>
      </NavbarLayout>
    </EnvironmentBannerLayout>
  );
}

function RightPaneForm() {
  const { openRightPane } = useRightPaneActions();
  return (
    <FormSectionLayout
      withRightPane
      title="Create Contact"
      actions={[
        {
          label: "Edit address",
          variant: "secondary",
          onClick: () => openRightPane({ content: <AddressPanel /> }),
        },
      ]}
      sections={createFieldLayoutSections()}
    />
  );
}

function AddressPanel() {
  return (
    <RightPanePanel title="Address">
      <FieldLayout>
        <FieldRow columns={4}>
          <FieldRowItem span={2}>
            <TextField label="Street" value="1200 S Lamar Blvd" onChange={noop} />
          </FieldRowItem>
          <TextField label="City" value="Austin" onChange={noop} />
          <TextField label="State" value="TX" onChange={noop} />
        </FieldRow>
        <FieldRow>
          <TextField label="Postal Code" value="78704" onChange={noop} />
          <TextField label="Country" value="US" onChange={noop} />
        </FieldRow>
        <TextAreaField label="Notes" value="" onChange={noop} />
      </FieldLayout>
    </RightPanePanel>
  );
}

/** A `FormSectionLayout` section whose child sections each hold a `FieldLayout`. */
function createSignatoriesSection() {
  return {
    title: "Signatories",
    description: "People who can sign for this contact.",
    childSections: ["Primary", "Secondary"].map((title) => ({
      id: title.toLowerCase(),
      title,
      fields: (
        <FieldLayout>
          <FieldRow>
            <TextField label="Name" value="" onChange={noop} />
            <TextField label="Email" value="" onChange={noop} />
          </FieldRow>
        </FieldLayout>
      ),
    })),
  };
}

/** `FormSectionLayout` sections that lay out real fields with `FieldLayout`, `FieldRow`, and `FieldRowItem`. */
function createFieldLayoutSections() {
  const states = [
    { id: "TX", name: "Texas" },
    { id: "CO", name: "Colorado" },
    { id: "GA", name: "Georgia" },
  ];
  const countries = [
    { id: "US", name: "United States" },
    { id: "CA", name: "Canada" },
  ];
  return [
    {
      title: "Contact",
      fields: (
        <FieldLayout>
          <FieldRow>
            <TextField label="Name" value="Alex Morgan" onChange={noop} />
            <TextField label="Title" value="Project Manager" onChange={noop} />
          </FieldRow>
          <TextField label="Email" value="alex.morgan@example.com" onChange={noop} />
          <FieldRow>
            <TextField label="Office Phone" value="512-555-0148" onChange={noop} />
            <TextField label="Mobile Phone" value="512-555-0192" onChange={noop} />
          </FieldRow>
          <TextAreaField
            label="Notes"
            value="Billing signatory. Send purchase orders to this contact."
            onChange={noop}
          />
        </FieldLayout>
      ),
    },
    {
      title: "Address",
      fields: (
        <FieldLayout>
          <FieldRow columns={4}>
            <FieldRowItem span={2}>
              <TextField label="Street" value="1200 S Lamar Blvd" onChange={noop} />
            </FieldRowItem>
            <TextField label="City" value="Austin" onChange={noop} />
            <MenuSelectField label="State" value="TX" options={states} onSelect={noop} />
          </FieldRow>
          <FieldRow>
            <TextField label="Postal Code" value="78704" onChange={noop} />
            <MenuSelectField label="Country" value="US" options={countries} onSelect={noop} />
          </FieldRow>
        </FieldLayout>
      ),
    },
    {
      title: "Margins",
      fields: (
        <FieldLayout>
          <FieldRow columns={4}>
            <TextField label="Pre-Cutoff Margin" value="40%" onChange={noop} />
            <TextField label="Post-Cutoff Margin" value="" onChange={noop} />
            <TextField label="Selection Fee" value="" onChange={noop} />
            <TextField label="Minimum Price" value="" onChange={noop} />
          </FieldRow>
          <TextAreaField label="Update Note" value="" onChange={noop} />
        </FieldLayout>
      ),
    },
  ];
}
