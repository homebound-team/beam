import type { Meta } from "@storybook/react-vite";
import { RightPanePanel } from "src/components/Layout/RightPaneLayout/RightPanePanel";
import { useRightPaneActions } from "src/components/Layout/RightPaneLayout/useRightPane";
import { Css, Tokens } from "src/Css";
import { FieldRow, FieldRowItem } from "src/forms/FieldRow";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { TextAreaField } from "src/inputs/TextAreaField";
import { TextField } from "src/inputs/TextField";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { FormSectionLayout } from "src/layouts/FormSectionLayout/FormSectionLayout";
import { FocusedFormLayout, type FocusedFormLayoutProps } from "src/layouts/Workflow/FocusedFormLayout";
import { noop } from "src/utils/helpers";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { createFormSections, createRightPaneTriggers } from "src/utils/sbComponents";
import { action } from "storybook/actions";

export default {
  title: "Layouts/Workflows/Focused Form",
  component: FocusedFormLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

/** Env banner → `FocusedFormLayout` → `FormSectionLayout` with JumpLinks and a body-hosted right pane. */
export function Default() {
  return (
    <WorkflowChrome>
      <FocusedFormBody />
    </WorkflowChrome>
  );
}

/** Layout-level Comments / History triggers — do not also set `withRightPane` on the body. */
export function WithRightPaneTriggers() {
  return (
    <WorkflowChrome rightPaneTriggers={createRightPaneTriggers()}>
      <FormSectionLayout
        withJumpLinks
        title="Link Design Package"
        description="Connect this package to a market and give it a name."
        sections={createFormSections()}
      />
    </WorkflowChrome>
  );
}

/** Editing an existing object with a destructive action: Cancel / Remove / Save. Remove confirms before it runs. */
export function WithDestructiveAction() {
  return (
    <WorkflowChrome
      destructiveAction={{
        onConfirm: action("remove confirmed"),
        confirmTitle: "Remove this material?",
        confirmMessage: "The listing and its variants will be deleted from the catalog.",
      }}
    >
      <FormSectionLayout
        withJumpLinks
        title="Edit Material Listing"
        description="Update the listing details or remove it from the catalog."
        sections={createFormSections()}
      />
    </WorkflowChrome>
  );
}

/** Stay-pinned page banner under the workflow header. */
export function WithBanner() {
  return (
    <WorkflowChrome
      banner={{
        type: "info",
        title: "Updated Costs Ready",
        description: "Updated calculations are ready for 632 configurations.",
      }}
    >
      <FocusedFormBody />
    </WorkflowChrome>
  );
}

/** `aiMode` on both the workflow chrome and the form body. */
export function AiMode() {
  return (
    <WorkflowChrome aiMode>
      <FormSectionLayout
        aiMode
        withJumpLinks
        title="Link Design Package"
        description="Connect this package to a market and give it a name."
        sections={createFormSections()}
      />
    </WorkflowChrome>
  );
}
AiMode.storyName = "AI Mode";

/** Trade partner contact: paired fields, then a note that stays the full row. */
export function FieldRows() {
  return (
    <WorkflowChrome title="Create Contact">
      <FormSectionLayout
        withJumpLinks
        title="Contact"
        description="For billing signatories, include their business address."
        sections={[
          { title: "Contact", fields: <ContactFields /> },
          { title: "Address", fields: <AddressFields /> },
          { title: "Margins", fields: <MarginFields /> },
        ]}
      />
    </WorkflowChrome>
  );
}

function WorkflowChrome({ children, ...props }: Partial<FocusedFormLayoutProps>) {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <FocusedFormLayout
        title="Create Design Package"
        onCancel={action("cancel clicked")}
        onComplete={action("complete clicked")}
        {...props}
      >
        {children}
      </FocusedFormLayout>
    </EnvironmentBannerLayout>
  );
}

function FocusedFormBody() {
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
          onClick: () =>
            openRightPane({
              content: (
                <RightPanePanel title="Package detail">
                  <p css={Css.sm.color(Tokens.OnSurfaceMuted).$}>
                    Document-scroll pane hosted by the form body; close from the pane header.
                  </p>
                </RightPanePanel>
              ),
            }),
        },
      ]}
      sections={createFormSections()}
    />
  );
}

function ContactFields() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      <FieldRow>
        <TextField label="Name" value="Alex Morgan" onChange={noop} />
        <TextField label="Title" value="Project Manager" onChange={noop} />
      </FieldRow>
      <FieldRow>
        <TextField label="Email" value="alex.morgan@example.com" onChange={noop} />
      </FieldRow>
      <FieldRow>
        <TextField label="Office Phone" value="512-555-0148" onChange={noop} />
        <TextField label="Mobile Phone" value="512-555-0192" onChange={noop} />
      </FieldRow>
      {/* Span 4 fills the row at four columns, and clamps to the row when it wraps to two or one. */}
      <FieldRow columns={4}>
        <FieldRowItem span={4}>
          <TextAreaField
            label="Notes"
            value="Billing signatory. Send purchase orders to this contact."
            onChange={noop}
          />
        </FieldRowItem>
      </FieldRow>
    </div>
  );
}

function AddressFields() {
  const states = [
    { id: "TX", name: "Texas" },
    { id: "CO", name: "Colorado" },
    { id: "GA", name: "Georgia" },
  ];
  const countries = [
    { id: "US", name: "United States" },
    { id: "CA", name: "Canada" },
  ];
  return (
    <div css={Css.df.fdc.gap3.$}>
      <FieldRow>
        <TextField label="Street" value="1200 S Lamar Blvd" onChange={noop} />
      </FieldRow>
      <FieldRow>
        <TextField label="City" value="Austin" onChange={noop} />
        <MenuSelectField label="State" value="TX" options={states} onSelect={noop} />
      </FieldRow>
      <FieldRow>
        <TextField label="Postal Code" value="78704" onChange={noop} />
        <MenuSelectField label="Country" value="US" options={countries} onSelect={noop} />
      </FieldRow>
    </div>
  );
}

function MarginFields() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      <FieldRow columns={4}>
        <TextField label="Pre-Cutoff Margin" value="40%" onChange={noop} />
        <TextField label="Post-Cutoff Margin" value="" onChange={noop} />
        <TextField label="Selection Fee" value="" onChange={noop} />
        <TextField label="Minimum Price" value="" onChange={noop} />
      </FieldRow>
      <FieldRow columns={4}>
        <FieldRowItem span={4}>
          <TextAreaField label="Update Note" value="" onChange={noop} />
        </FieldRowItem>
      </FieldRow>
    </div>
  );
}
