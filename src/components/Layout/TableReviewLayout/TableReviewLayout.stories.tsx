import { Meta } from "@storybook/react-vite";
import { ReactNode, useMemo, useState } from "react";
import { Button } from "src/components/Button";
import { GridDataRow } from "src/components/Table";
import { column } from "src/components/Table/utils/columns";
import { simpleHeader } from "src/components/Table/utils/simpleHelpers";
import { Css } from "src/Css";
import { withBeamDecorator, withDimensions, withRouter } from "src/utils/sb";
import { SidePanel } from "./SidePanel";
import { TableReviewLayout as TableReviewLayoutComponent } from "./TableReviewLayout";

export default {
  component: TableReviewLayoutComponent,
  decorators: [withBeamDecorator, withDimensions(), withRouter()],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

type Data = {
  id: string;
  code: string;
  itemCode: string;
  name: string;
  location: string;
  feature: string;
  requestType: "ADD" | "DELETE";
  designerName: string;
  requestDate: string;
  takeoffSection: string;
  materialCode: string;
  uom: string;
  qty: string;
  budget: string;
  priority: string;
};

type HeaderRow = { kind: "header"; id: string; data: undefined };
type DataRow = { kind: "data"; id: string; data: Data };
type Row = HeaderRow | DataRow;

const rows: GridDataRow<Row>[] = [
  simpleHeader,
  row("1", "5501", "BA-TR", "Towel / Robe Hook", "Primary Bath 205", "Towel Bar", "ADD", "Skyler Gibson", "03/19/2026", "Bath Accessories", "BA-TR-001", "EA", "2", "$45.00", "High"),
  row("2", "5501", "BA-TH", "Tissue Holder", "Bath 112", "Tissue", "ADD", "Skyler Gibson", "03/19/2026", "Bath Accessories", "BA-TH-002", "EA", "1", "$32.00", "Medium"),
  row("3", "5501", "BA-TR", "Towel / Robe Hook", "Every Day Entry 115", "Hooks", "ADD", "Skyler Gibson", "03/19/2026", "Bath Accessories", "BA-TR-001", "EA", "3", "$45.00", "High"),
  row("4", "5501", "BA-TR", "Towel / Robe Hook", "Every Day Entry 115", "Hooks", "DELETE", "Skyler Gibson", "03/17/2026", "Bath Accessories", "BA-TR-001", "EA", "1", "$45.00", "Low"),
  row("5", "5503", "CHW", "Cabinet Hardware", "Kitchen", "Island > Base > Door", "ADD", "Skyler Gibson", "03/17/2026", "Cabinet Hardware", "CHW-003", "EA", "12", "$8.50", "Medium"),
];

function row(id: string, code: string, itemCode: string, name: string, location: string, feature: string, requestType: "ADD" | "DELETE", designerName: string, requestDate: string, takeoffSection: string, materialCode: string, uom: string, qty: string, budget: string, priority: string): DataRow {
  return { kind: "data", id, data: { id, code, itemCode, name, location, feature, requestType, designerName, requestDate, takeoffSection, materialCode, uom, qty, budget, priority } };
}

const description = (
  <>
    Review and manage slot change requests from design packages.
    <br />
    Accepting a request will add it to Takeoff.
    <br />
    If you reject a request, please notify the interior designer and include a reason.
  </>
);

export function TableReviewLayout() {
  const [panelContent, setPanelContent] = useState<ReactNode>(null);

  const columns = useMemo(
    () => [
      column<Row>({ id: "code", name: "Code", header: "Code", data: ({ code }) => code, w: "80px" }),
      column<Row>({ id: "itemCode", name: "Item code", header: "Item code", data: ({ itemCode }) => itemCode, w: "110px" }),
      column<Row>({ id: "name", name: "Name", header: "Name", data: ({ name }) => name, w: "180px" }),
      column<Row>({ id: "location", name: "Location", header: "Location", data: ({ location }) => location, w: "180px" }),
      column<Row>({ id: "feature", name: "Feature", header: "Feature", data: ({ feature }) => feature, w: "160px" }),
      column<Row>({
        id: "type",
        name: "Type",
        header: "Type",
        data: ({ requestType }) => ({
          content: (
            <span css={{ ...Css.xsSb.br4.pxPx(6).pyPx(2).$, ...(requestType === "ADD" ? Css.green800.bgGreen100.$ : Css.red800.bgRed100.$) }}>
              {requestType}
            </span>
          ),
          value: requestType,
        }),
        w: "90px",
      }),
      column<Row>({ id: "designerName", name: "Designer name", header: "Designer name", data: ({ designerName }) => designerName, w: "160px" }),
      column<Row>({ id: "requestDate", name: "Request date", header: "Request date", data: ({ requestDate }) => requestDate, w: "130px" }),
      column<Row>({ id: "takeoffSection", name: "Takeoff section", header: "Takeoff section", data: ({ takeoffSection }) => takeoffSection, w: "160px" }),
      column<Row>({ id: "materialCode", name: "Material code", header: "Material code", data: ({ materialCode }) => materialCode, w: "130px" }),
      column<Row>({ id: "uom", name: "UoM", header: "UoM", data: ({ uom }) => uom, w: "80px" }),
      column<Row>({ id: "qty", name: "Qty", header: "Qty", data: ({ qty }) => qty, w: "70px" }),
      column<Row>({ id: "budget", name: "Budget", header: "Budget", data: ({ budget }) => budget, w: "90px" }),
      column<Row>({ id: "priority", name: "Priority", header: "Priority", data: ({ priority }) => priority, w: "90px" }),
      column<Row>({
        id: "action",
        name: "Action",
        header: "",
        data: (rowData) => ({
          content: (
            <Button
              label="View"
              variant="secondary"
              onClick={() => {
                const isOdd = Number(rowData.id) % 2 !== 0;
                setPanelContent(
                  <SidePanel
                    title={rowData.name}
                    primaryAction={{ label: "Accept", icon: "check", onClick: () => setPanelContent(null) }}
                    secondaryAction={{ label: "Reject", icon: "x", onClick: () => setPanelContent(null) }}
                  >
                    <div css={Css.p3.df.fdc.gap3.$}>
                      {isOdd ? (
                        <>
                          <Field label="Placeholder type" value={`${rowData.itemCode} ${rowData.name}`} />
                          <Field label="Code" value={rowData.code} />
                          <Field label="Location" value={rowData.location} />
                          <Field label="Feature" value={rowData.feature} />
                          <Field label="Type" value={rowData.requestType} />
                          <Field label="Designer" value={rowData.designerName} />
                          <Field label="Request date" value={rowData.requestDate} />
                          <Field label="Takeoff section" value={rowData.takeoffSection} />
                          <Field label="Material code" value={rowData.materialCode} />
                          <Field label="UoM" value={rowData.uom} />
                          <Field label="Qty" value={rowData.qty} />
                          <Field label="Budget" value={rowData.budget} />
                          <Field label="Priority" value={rowData.priority} />
                        </>
                      ) : (
                        <>
                          <Field label="Placeholder type" value={`${rowData.itemCode} ${rowData.name}`} />
                          <Field label="Location" value={rowData.location} />
                          <Field label="Feature" value={rowData.feature} />
                          <Field label="Type" value={rowData.requestType} />
                          <Field label="UoM" value={rowData.uom} />
                          <Field label="Qty" value={rowData.qty} />
                          <Field label="Budget" value={rowData.budget} />
                        </>
                      )}
                    </div>
                  </SidePanel>,
                );
              }}
            />
          ),
          value: "",
        }),
        w: "90px",
        clientSideSort: false,
        sticky: "right",
      }),
    ],
    [],
  );

  return (
    <TableReviewLayoutComponent
      pageTitle="Review slot requests"
      breadcrumb={{ href: "/", label: "The Emerson plan" }}
      description={description}
      closeAction={() => {}}
      tableProps={{ columns, rows }}
      panelContent={panelContent}
      onClosePanel={() => setPanelContent(null)}
    />
  );
}

export function EmptyState() {
  const columns = useMemo(
    () => [column<Row>({ header: "Name", data: ({ name }) => name })],
    [],
  );
  return (
    <TableReviewLayoutComponent
      pageTitle="Review slot requests"
      breadcrumb={{ href: "/", label: "The Emerson plan" }}
      description={description}
      closeAction={() => {}}
      tableProps={{ columns, rows: [simpleHeader] }}
      emptyState={
        <div css={Css.df.fdc.aic.gap2.$}>
          <div css={Css.xl.$}>All set!</div>
          <div css={Css.sm.gray500.$}>All slot requests have been reviewed.</div>
        </div>
      }
    />
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div css={Css.xs.gray500.mb1.$}>{label}</div>
      <div css={Css.sm.$}>{value}</div>
    </div>
  );
}
