import type { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { FieldRow, FieldRowItem } from "src/forms/FieldRow";
import { TextField } from "src/inputs/TextField";
import { noop } from "src/utils/helpers";

export default {
  component: FieldRow,
} as Meta;

/** 1040px, the page content width. Four columns fit. */
export function PageContent() {
  return (
    <div css={Css.wPx(1040).$}>
      <FieldRows />
    </div>
  );
}

/** 720px, the form column. Four columns fit. */
export function FormColumn() {
  return (
    <div css={Css.wPx(720).$}>
      <FieldRows />
    </div>
  );
}

/** 600px, between 520px and 639px. A four-column row wraps to two. */
export function TwoColumns() {
  return (
    <div css={Css.wPx(600).$}>
      <FieldRows />
    </div>
  );
}

/** 448px, a right pane. Every row stacks to one column. */
export function RightPane() {
  return (
    <div css={Css.wPx(448).$}>
      <FieldRows />
    </div>
  );
}

function FieldRows() {
  return (
    <div css={Css.df.fdc.gap3.$}>
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
      {/* Flat rather than nested: a nested row measures this span, which stays under 520px, and stacks. */}
      <FieldRow columns={4}>
        <FieldRowItem span={2}>
          <TextField label="Street" value="" onChange={noop} />
        </FieldRowItem>
        <TextField label="City" value="" onChange={noop} />
        <TextField label="State" value="" onChange={noop} />
      </FieldRow>
    </div>
  );
}
