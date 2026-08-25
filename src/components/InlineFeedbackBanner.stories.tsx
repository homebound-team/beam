import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { Button } from "src/components/Button";
import {
  condensedStyle,
  GridColumn,
  GridDataRow,
  GridTable,
  simpleHeader,
  SimpleHeaderAndData,
} from "src/components/index";
import { InlineFeedbackBanner, InlineFeedbackBannerProps } from "src/components/InlineFeedbackBanner";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { viewportModes } from "src/utils/sb";

export default {
  component: InlineFeedbackBanner,
  parameters: {
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1686-10522&m=dev",
    },
  },
} as Meta;

const reviewMatches = { label: "Review Matches", onClick: noop };
const view = { label: "View", onClick: noop };
const keepAndRemove = [
  { label: "Keep", onClick: noop },
  { label: "Remove", onClick: noop },
];

/** The content variants, standalone. */
export function Default() {
  return (
    <div css={Css.df.fdc.gap4.wPx(720).$}>
      <Sample title="Icon-only tag">
        <InlineFeedbackBanner
          type="error"
          description="Add Stained Wood Ceiling was not found in the option library. Review 2 Possible matches."
          actions={[reviewMatches]}
        />
        <InlineFeedbackBanner
          type="warning"
          description="Used as a requirement for Extend Backsplash Kitchen 109."
          actions={keepAndRemove}
        />
      </Sample>

      <Sample title="With tag text">
        <InlineFeedbackBanner
          type="error"
          tagText="Missing costs"
          description="Two bid lines are missing costs."
          actions={[view]}
        />
        <InlineFeedbackBanner
          type="warning"
          tagText="Cost missing scope"
          description="Two costs have been awarded but do not have any associated takeoff line items. Remove the bid line or contact the estimation team to update takeoffs."
          actions={[view]}
        />
      </Sample>

      <Sample title="Without actions">
        <InlineFeedbackBanner type="warning" description="Used as a requirement for Extend Backsplash Kitchen 109." />
      </Sample>

      <Sample title="Long copy wraps, tag and actions stay on the first line">
        <div css={Css.wPx(420).$}>
          <InlineFeedbackBanner
            type="error"
            tagText="Unmatched"
            description="Add Recessed Lighting was not found in the option library. It was last seen in the archived catalog from a project that closed out two quarters ago."
            actions={[reviewMatches]}
          />
        </div>
      </Sample>

      <Sample title="Inline control inside the description">
        <InlineFeedbackBanner
          type="error"
          description={
            <span>
              Add Tile Surround was not found in the option library.{" "}
              <Button variant="text" label="Review 2 possible matches" onClick={noop} />
            </span>
          }
        />
      </Sample>

      <Sample title="Stacked, as several findings on one record">
        <div css={Css.df.fdc.gap1.$}>
          <InlineFeedbackBanner
            type="error"
            tagText="Missing costs"
            description="Two bid lines are missing costs."
            actions={[view]}
          />
          <InlineFeedbackBanner
            type="error"
            tagText="Missing options"
            description="Three options are missing from the bid package."
            actions={[view]}
          />
          <InlineFeedbackBanner
            type="warning"
            tagText="Missing trade"
            description="This bid is a provisional estimate and needs to be awarded to a trade."
            actions={[view]}
          />
        </div>
      </Sample>
    </div>
  );
}

/** In a `GridTable` row's `companion` slot — the case DS-320 was drawn for. */
export function InGridTableCompanionRows() {
  return (
    <GridTable
      columns={columns}
      rows={[
        simpleHeader,
        row("1", "Stained Wood Ceiling", "Unmatched", {
          type: "error",
          description: "Add Stained Wood Ceiling was not found in the option library. Review 2 Possible matches.",
          actions: [reviewMatches],
        }),
        row("2", "Extend Backsplash", "In use", {
          type: "warning",
          description: "Used as a requirement for Extend Backsplash Kitchen 109.",
          actions: keepAndRemove,
        }),
        // No actions — the copy stretches the full width.
        row("3", "Kitchen 109", "In use", {
          type: "warning",
          description: "Used as a requirement for Extend Backsplash Kitchen 109.",
        }),
        // A plain row, for contrast against its banner-carrying neighbors.
        { kind: "data", id: "4", data: { name: "Quartz Countertop", status: "Matched" } },
        // Long copy, to show the tag and actions staying on the first line as the description wraps.
        row("5", "Recessed Lighting", "Unmatched", {
          type: "error",
          tagText: "Unmatched",
          description:
            "Long Wrapping desc: Add Recessed Lighting was not found in the option library. Review 2 Possible matches. It was last seen in the archived catalog from a project that closed out two quarters ago. Add Recessed Lighting was not found in the option library. Review 2 Possible matches. It was last seen in the archived catalog from a project that closed out two quarters ago. Add Recessed Lighting was not found in the option library. Review 2 Possible matches. It was last seen in the archived catalog from a project that closed out two quarters ago.",
          actions: [reviewMatches],
        }),
      ]}
    />
  );
}

/** `companion` defaults to trailing; `leading` sits the banner above its row instead. */
export function LeadingAndTrailing() {
  return (
    <GridTable
      columns={columns}
      rows={[
        simpleHeader,
        {
          kind: "data",
          id: "1",
          data: { name: "Trailing (default)", status: "Unmatched" },
          companion: <InlineFeedbackBanner type="error" description="Sits below the row it belongs to." />,
        },
        {
          kind: "data",
          id: "2",
          data: { name: "Leading", status: "In use" },
          companion: {
            position: "leading",
            content: <InlineFeedbackBanner type="warning" description="Sits above the row it belongs to." />,
          },
        },
      ]}
    />
  );
}

/** Companions indent with their row, so banners line up under nested children. */
export function NestedRows() {
  return (
    <GridTable<NestedRow>
      columns={nestedColumns}
      rows={[
        simpleHeader,
        {
          kind: "parent",
          id: "p1",
          data: { name: "Kitchen 109", status: "2 unmatched" },
          companion: (
            <InlineFeedbackBanner
              type="warning"
              description="2 options in this group need review."
              actions={[reviewMatches]}
            />
          ),
          children: [
            {
              kind: "child",
              id: "p1c1",
              data: { name: "Stained Wood Ceiling", status: "Unmatched" },
              companion: (
                <InlineFeedbackBanner
                  type="error"
                  description="Not found in the option library."
                  actions={[reviewMatches]}
                />
              ),
            },
            { kind: "child", id: "p1c2", data: { name: "Extend Backsplash", status: "Matched" } },
          ],
        },
      ]}
    />
  );
}

/** `condensedStyle` tightens the cells around it; the banner keeps its own height. */
export function CondensedStyle() {
  return (
    <GridTable
      style={condensedStyle}
      columns={columns}
      rows={[
        simpleHeader,
        row("1", "Stained Wood Ceiling", "Unmatched", {
          type: "error",
          description: "Add Stained Wood Ceiling was not found in the option library. Review 2 Possible matches.",
          actions: [reviewMatches],
        }),
        { kind: "data", id: "2", data: { name: "Quartz Countertop", status: "Matched" } },
      ]}
    />
  );
}

type Data = { name: string; status: string };
type Row = SimpleHeaderAndData<Data>;

const columns: GridColumn<Row>[] = [
  { header: "Option", data: ({ name }) => name },
  { header: "Status", data: ({ status }) => status },
];

/** Builds a data row carrying a trailing `InlineFeedbackBanner` companion. */
function row(id: string, name: string, status: string, banner: InlineFeedbackBannerProps): GridDataRow<Row> {
  return { kind: "data", id, data: { name, status }, companion: <InlineFeedbackBanner {...banner} /> };
}

type NestedRow =
  | { kind: "header"; data: undefined }
  | { kind: "parent"; id: string; data: Data }
  | { kind: "child"; id: string; data: Data };

const nestedColumns: GridColumn<NestedRow>[] = [
  { header: () => "Option", parent: ({ name }) => name, child: ({ name }) => name },
  { header: () => "Status", parent: ({ status }) => status, child: ({ status }) => status },
];

function Sample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 css={Css.lg.mb1.$}>{title}</h2>
      <div css={Css.df.fdc.gap2.$}>{children}</div>
    </div>
  );
}
