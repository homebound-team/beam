import { Meta } from "@storybook/react";
import { useState } from "react";
import { FormLines, StaticField } from "..";
import { Pagination } from "./Pagination";

export default {
  title: "Workspace/Components/Pagination",
  component: Pagination,
  parameters: {
    // To better view the icon hover state
    backgrounds: { default: "white" },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=3214%3A10519",
    },
  },
} as Meta;

export function WithPages() {
  return <RenderPagination totalRows={999} />;
}

export function NoPages() {
  return <RenderPagination totalRows={0} />;
}

export function OnlyOnePage() {
  return <RenderPagination totalRows={14} />;
}

function RenderPagination({ totalRows }: { totalRows: number }) {
  const page = useState({ pageNumber: 1, pageSize: 100 });
  return (
    <>
      <FormLines labelStyle="left">
        <StaticField label="Number of items" value={String(totalRows)} />
        <StaticField label="Current page" value={String(page[0].pageNumber)} />
      </FormLines>
      <Pagination totalCount={totalRows} page={page} />
    </>
  );
}
