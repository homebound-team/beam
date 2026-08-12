import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { AiPanel } from "src/components/AiPanel";
import { Button } from "src/components/Button";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Css } from "src/Css";
import { FormSection, FormSectionProps } from "src/forms/FormSection";
import { SelectField, TextAreaField, TextField } from "src/inputs";
import { EnvironmentBannerLayout } from "src/layouts/EnvironmentBannerLayout/EnvironmentBannerLayout";
import { viewportModes, withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";
import { TableExample } from "src/utils/sbComponents";
import { action } from "storybook/actions";
import { WorkflowLayout, WorkflowLayoutStep } from "./WorkflowLayout";

export default {
  component: WorkflowLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} satisfies Meta;

export function Default() {
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      onSaveAndExit={action("save and exit clicked")}
      steps={makeSteps()}
    />
  );
}

/**
 * A step whose content is a wide table — it overflows horizontally instead of shrinking to fit the
 * viewport. Most visible at the `mobile1` Chromatic viewport, or by resizing the window below 600px.
 */
export function WideStepContentOverflows() {
  const steps = makeSteps();
  steps[0] = { ...steps[0], content: <TableExample numCols={10} numRows={20} /> };
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      steps={steps}
    />
  );
}

/**
 * A step whose content leads with a `ContentHeader` above a wide table. Scroll the page horizontally
 * (most visible at the `mobile1` Chromatic viewport, or by resizing the window below 600px) — the table
 * scrolls away, but `ContentHeader` stays pinned to the visible left/right edges since it only sticks
 * horizontally (it has no `top` set, so it still scrolls away normally on the vertical axis).
 *
 * The wrapping div needs `mw("fit-content")` for this to work — `ContentHeader`'s sticky positioning
 * has no "room" to operate unless its containing block is at least as wide as the table's full content
 * width (see the doc comment on `ContentHeader` itself), the same technique `GridTable` uses internally.
 */
export function WideContentWithContentHeader() {
  const steps = makeSteps();
  steps[0] = {
    ...steps[0],
    content: (
      <div css={Css.df.fdc.gap2.pt3.maxw("1440px").mxa.$}>
        <ContentHeader
          title="Trade Partners"
          description="Sticky to the left/right document-scroll bounds, but scrolls away vertically."
          actions={[{ label: "Add", onClick: action("add clicked") }]}
        />
        <TableExample numCols={10} numRows={20} />
      </div>
    ),
  };
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      steps={steps}
    />
  );
}

/**
 * `WorkflowLayout` nested under `EnvironmentBannerLayout` with a banner actually displayed, pushing the
 * whole layout down by `environmentBannerSizePx`. Tall step content so the page scrolls — sanity check
 * that the header renders correctly in that composed position and stays pinned while scrolling.
 */
export function Composed() {
  return (
    <EnvironmentBannerLayout environmentBanner={{ env: "qa" }}>
      <WorkflowLayout
        title="Workflow Layout"
        onCancel={action("cancel clicked")}
        completeLabel="Save"
        onComplete={action("complete clicked")}
        steps={makeSteps(50)}
      />
    </EnvironmentBannerLayout>
  );
}

/**
 * An `AiPanel` leading the active step's content — which is `steps[].content` here, not `children`.
 * This header is always-sticky rather than auto-hiding, so the panel never scrolls out from under it.
 */
export function WithAiPanel() {
  const steps = makeSteps(20);
  steps[0] = {
    ...steps[0],
    content: (
      <>
        <AiPanel
          title="Importing Details..."
          message="This process can take a few minutes. Feel free to keep working in another tab."
        />
        <StepContent title={tabLabels.trade} numRows={20} />
      </>
    ),
  };
  return (
    <WorkflowLayout
      title="Workflow Layout"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      steps={steps}
    />
  );
}

/**
 * Why `AiPanel` takes `children`: the designs put an entire page form inside its card. `variant="page"`
 * is what makes it fit — the wash spans the step body while the card stays a centered column.
 *
 * Two knowing deviations from the design: the form's headings come from `FormSection` rather than the
 * panel's gradient title, and the AI-imported values aren't tinted purple — that's a separate field
 * treatment Beam doesn't support yet (`TextFieldXss` allows no color or background).
 *
 * Known gap: on a tall viewport the wash stops at the content and the document background shows below
 * it. That's `WorkflowLayout` having no height for its `fg1` body to grow into, so `flex-grow` on the
 * panel does nothing. Any full-width coloured section would show it. Tracked separately.
 */
export function FullAiPanel() {
  return (
    <WorkflowLayout
      title="Add Material"
      onCancel={action("cancel clicked")}
      completeLabel="Save"
      onComplete={action("complete clicked")}
      // Matched against `defaultTestId(step.label)`, so camelCased.
      defaultStep="details"
      steps={[
        { label: "Import", isValid: true, content: <ImportStepContent /> },
        { label: "Details", isValid: false, content: <ReviewStepContent /> },
      ]}
    />
  );
}

/** The step that kicks the import off — the same panel, hosting a URL field instead of a form. */
function ImportStepContent() {
  const [url, setUrl] = useState<string | undefined>("");
  return (
    <AiPanel
      variant="page"
      title="Import Material Details"
      message="Select your material type and the manufacturer's URL to import item details. After content is populated you may add or edit it before saving."
    >
      <div css={Css.df.fdc.gap2.w100.maxwPx(720).mxa.mt2.$}>
        <TextField label="URL" value={url} onChange={setUrl} />
        <div css={Css.df.jcfe.$}>
          <Button label="Import" onClick={action("import clicked")} />
        </div>
      </div>
    </AiPanel>
  );
}

/** The imported form, living inside the panel's card. */
function ReviewStepContent() {
  const [type, setType] = useState<string | undefined>("wall");
  const [brand, setBrand] = useState<string | undefined>("kichler");
  const [name, setName] = useState<string | undefined>("Kichler Crosby 1-Light Wall Sconce");
  const [description, setDescription] = useState<string | undefined>(
    'The Crosby 9.25" 1 light Wall Sconce features a contemporary style with its clean lines and metal accents in Brushed Nickel finish and satin etched cased opal. The Crosby wall sconce works in several aesthetic environments, including traditional and modern.',
  );
  const sections: FormSectionProps[] = [
    {
      title: "Material Overview",
      fields: (
        <div css={Css.df.fdc.gap2.$}>
          <div css={Css.df.gap2.$}>
            <div css={Css.fg1.$}>
              <SelectField label="Type" value={type} onSelect={setType} options={materialTypes} />
            </div>
            <div css={Css.fg1.$}>
              <SelectField label="Brand" value={brand} onSelect={setBrand} options={brands} />
            </div>
          </div>
          <TextField label="Name" value={name} onChange={setName} />
          <TextAreaField label="Description" value={description} onChange={setDescription} />
        </div>
      ),
    },
    { title: "Pricing", fields: <PricingFields /> },
    {
      title: "Material Lead Times",
      actions: [
        { label: "Add Lead Time Variant", icon: "plus", variant: "tertiary", onClick: action("add lead time") },
      ],
      fields: <PricingFields />,
    },
    {
      title: "Variants",
      actions: [{ label: "Add", icon: "plus", variant: "tertiary", onClick: action("add variant") }],
      childSections: [
        { id: "variant-1", title: "Variant 1", fields: <PricingFields /> },
        { id: "variant-2", title: "Variant 2", fields: <PricingFields /> },
      ],
    },
  ];
  return (
    <AiPanel
      variant="page"
      title="Review Imported Material Details"
      message="Please review the imported data highlighted below. You may edit or add to the form before saving."
    >
      {/*
          `FormSection`s directly rather than `FormSectionLayout`, which requires a `title` — here the
          panel's own gradient title is the form-level heading (the design's "Form Title 20"), so a
          layout title would duplicate it. This mirrors `FormSectionLayout`'s own column and spacing.
        */}
      <div css={Css.df.fdc.gap8.w100.maxwPx(720).mxa.pt4.$}>
        {sections.map((section) => (
          <FormSection key={section.title} {...section} />
        ))}
      </div>
    </AiPanel>
  );
}

/** The four-across money row the designs repeat under each section. */
function PricingFields() {
  const [values, setValues] = useState<(string | undefined)[]>(["40%", "", "", ""]);
  const labels = ["Pre-Cutoff Margin", "Post-Cutoff Margin", "Selection Fee", "Min Price"];
  return (
    <div css={Css.df.gap2.$}>
      {labels.map((label, i) => (
        <div key={label} css={Css.fg1.$}>
          <TextField
            label={label}
            value={values[i]}
            onChange={(v) => setValues((prev) => prev.map((old, j) => (j === i ? v : old)))}
          />
        </div>
      ))}
    </div>
  );
}

const materialTypes = [
  { id: "wall", name: "Wall Mounted Lights" },
  { id: "ceiling", name: "Ceiling Lights" },
];

const brands = [
  { id: "kichler", name: "Kichler" },
  { id: "kohler", name: "Kohler" },
];

const tabValues = ["trade", "draft", "send"] as const;
const tabLabels: Record<(typeof tabValues)[number], string> = {
  trade: "Trade Partners",
  draft: "Draft Email",
  send: "Send Email",
};

function makeSteps(contentRows = 0): WorkflowLayoutStep[] {
  return tabValues.map((value) => ({
    label: tabLabels[value],
    isValid: false,
    content: <StepContent title={tabLabels[value]} numRows={contentRows} />,
  }));
}

function StepContent({ title, numRows = 0 }: { title: string; numRows?: number }) {
  return (
    <div css={Css.p3.$}>
      <h1 css={Css.xl2.mb2.$}>{title}</h1>
      <div css={Css.df.fdc.gap1.$}>
        {zeroTo(numRows).map((i) => (
          <div key={i} css={Css.hPx(48).br4.bgGray100.df.aic.pl2.$}>
            Row {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
