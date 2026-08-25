import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { GridColumn, GridTable, simpleHeader, SimpleHeaderAndData } from "src/components/index";
import { RowBanner } from "src/components/RowBanner";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { viewportModes } from "src/utils/sb";

export default {
  component: RowBanner,
  parameters: {
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1686-10522&m=dev",
    },
  },
} as Meta;

const errorCopy = "Add Stained Wood Ceiling was not found in the option library. Review 2 Possible matches.";
const warningCopy = "Used as a requirement for Extend Backsplash Kitchen 109.";
const reviewMatches = { label: "Review Matches", onClick: noop };
const keepAndRemove = [
  { label: "Keep", onClick: noop },
  { label: "Remove", onClick: noop },
];

export function Default() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <Sample title="Error">
        <RowBanner type="error" description={errorCopy} actions={[reviewMatches]} />
      </Sample>

      <Sample title="Warning">
        <RowBanner type="warning" description={warningCopy} actions={keepAndRemove} />
      </Sample>

      <Sample title="Without actions">
        <RowBanner type="warning" description={warningCopy} />
      </Sample>

      <Sample title="Long copy that wraps">
        <RowBanner
          type="error"
          description={`${errorCopy}${errorCopy}${errorCopy} It was last seen in the archived catalog from a project that closed out two quarters ago.`}
          actions={[reviewMatches]}
        />
      </Sample>
    </div>
  );
}

/** Where the banner is meant to live: a `GridTable` row's `companion` slot. */
export function InCompanionRows() {
  return (
    <GridTable
      columns={columns}
      rows={[
        simpleHeader,
        {
          kind: "data",
          id: "1",
          data: { name: "Stained Wood Ceiling", value: 2 },
          companion: <RowBanner type="error" description={errorCopy} actions={[reviewMatches]} />,
        },
        { kind: "data", id: "2", data: { name: "Extend Backsplash", value: 4 } },
        {
          kind: "data",
          id: "3",
          data: { name: "Kitchen 109", value: 7 },
          companion: {
            position: "leading",
            content: <RowBanner type="warning" description={warningCopy} actions={keepAndRemove} />,
          },
        },
      ]}
    />
  );
}

/**
 * How the banner reads once the row itself carries the AI tint.
 *
 * The tint is stood in for here with `aiBackground`; DS-250 adds real AI row styles to `GridTable`.
 */
export function OnAnAiTintedRow() {
  return (
    <div css={Css.df.fdc.gap2.aiBackground.p2.$}>
      <RowBanner type="error" description={errorCopy} actions={[reviewMatches]} />
      <RowBanner type="warning" description={warningCopy} actions={keepAndRemove} />
    </div>
  );
}

type Data = { name: string; value: number };
type Row = SimpleHeaderAndData<Data>;

const columns: GridColumn<Row>[] = [
  { header: "Name", data: ({ name }) => name },
  { header: "Value", data: ({ value }) => value },
];

function Sample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 css={Css.lg.mb1.$}>{title}</h2>
      {children}
    </div>
  );
}
