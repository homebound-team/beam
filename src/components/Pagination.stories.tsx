import { Meta } from "@storybook/react";
import { useState } from "react";
import { noop } from "src/utils";
import { withBeamDecorator } from "src/utils/sb";
import { FormLines, TextField } from "..";
import { PageSettings, Pagination } from "./Pagination";

const initPageSettings = { page: 1, perPage: 100 };

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
  decorators: [withBeamDecorator],
} as Meta;

export function WithPages() {
  return <RenderPagination totalRows={999} label="items" />;
}

export function NoPages() {
  return <RenderPagination totalRows={0} label="items" />;
}

export function OnlyOnePage() {
  return <RenderPagination totalRows={14} />;
}

function RenderPagination({ totalRows, label }: { totalRows: number; label?: string }) {
  const [settings, setSettings] = useState<PageSettings>({
    page: initPageSettings.page,
    perPage: initPageSettings.perPage,
  });

  return (
    <>
      <FormLines labelStyle="left">
        <TextField label={"Number of items"} readOnly value={String(totalRows)} onChange={noop} />
        <TextField label={"Current page"} readOnly value={String(settings.page)} onChange={noop} />
      </FormLines>
      <Pagination totalCount={totalRows} label={label ?? "items"} setSettings={setSettings} settings={settings} />
    </>
  );
}
