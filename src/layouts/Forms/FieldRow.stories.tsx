import type { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { TextField } from "src/inputs/TextField";
import { FieldLayout } from "src/layouts/Forms/FieldLayout";
import { FieldRow, FieldRowItem } from "src/layouts/Forms/FieldRow";
import { noop } from "src/utils/helpers";
import { LabeledExamples } from "src/utils/sb";

export default {
  title: "Layouts/Forms/Field Row",
  component: FieldRow,
  parameters: { layout: "fullscreen" },
} as Meta;

/** The same rows at each container width. Each row reads its own width, so the columns change with the width shown. */
export function Examples() {
  return (
    <LabeledExamples
      direction="column"
      gap={8}
      examples={[
        {
          label: "375px: upper bound of the 1-column layout",
          children: (
            <div css={Css.wPx(375).$}>
              <FieldRows />
            </div>
          ),
        },
        {
          label: "376px: lower bound of the 2-column layout",
          children: (
            <div css={Css.wPx(376).$}>
              <FieldRows />
            </div>
          ),
        },
        {
          label: "639px: upper bound of the 2-column layout",
          children: (
            <div css={Css.wPx(639).$}>
              <FieldRows />
            </div>
          ),
        },
        {
          label: "640px: lower bound of the 4-column layout",
          children: (
            <div css={Css.wPx(640).$}>
              <FieldRows />
            </div>
          ),
        },
      ]}
    />
  );
}

function FieldRows() {
  return (
    <FieldLayout>
      <FieldRow>
        <TextField label="Name" value="" onChange={noop} />
      </FieldRow>
      <FieldRow>
        <TextField label="First" value="" onChange={noop} />
        <TextField label="Last" value="" onChange={noop} />
      </FieldRow>
      <FieldRow columns={3}>
        <TextField label="First" value="" onChange={noop} />
        <TextField label="Middle" value="" onChange={noop} />
        <TextField label="Last" value="" onChange={noop} />
      </FieldRow>
      <FieldRow columns={4}>
        <TextField label="Qty" value="" onChange={noop} />
        <TextField label="Unit" value="" onChange={noop} />
        <TextField label="Price" value="" onChange={noop} />
        <TextField label="Total" value="" onChange={noop} />
      </FieldRow>
      {/* Flat rather than nested: a nested row measures this span, which stays under 376px, and stacks. */}
      <FieldRow columns={4}>
        <FieldRowItem span={2}>
          <TextField label="Street" value="" onChange={noop} />
        </FieldRowItem>
        <TextField label="City" value="" onChange={noop} />
        <TextField label="State" value="" onChange={noop} />
      </FieldRow>
    </FieldLayout>
  );
}
