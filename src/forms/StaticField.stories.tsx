import { Meta } from "@storybook/react";
import { Chips } from "src/components/Chips";
import { FieldGroup, FormLines } from "src/forms/FormLines";
import { StaticField as StaticFieldComponent } from "src/forms/StaticField";
import { TextField } from "src/inputs";
import { ButtonModal, Css } from "..";

export default {
  component: StaticFieldComponent,
  title: "Workspace/Forms/Static Field",
} as Meta;

export function StaticField() {
  return (
    <FormLines>
      <StaticFieldComponent label="Above" value="Bob" />
      <FieldGroup widths={["100px", "100px", "200px"]}>
        <StaticFieldComponent label="First" value="Bob" />
        <StaticFieldComponent label="First" value="Bob" />
        <StaticFieldComponent
          label={
            <>
              <span>First</span>
              <span css={Css.xs.ml1.$}>
                <ButtonModal content={<>Modal</>} variant="text" hideEndAdornment trigger={{ label: "See Details" }} />
              </span>
            </>
          }
          value="Bob"
        />
        <TextField label="First (read only TextField)" value="Bob" onChange={() => {}} readOnly />
      </FieldGroup>
      <StaticFieldComponent label="First">
        <Chips values={["First", "Last"]} />
      </StaticFieldComponent>
      <div css={Css.w25.$}>
        <StaticFieldComponent label="Left" value="Bob" labelStyle="left" />
      </div>
    </FormLines>
  );
}

export function StaticFieldsGrouped() {
  return (
    <div css={Css.w50.$}>
      <div css={Css.br8.ba.bGray300.bgWhite.$}>
        <div css={Css.df.gap4.m3.$}>
          <StaticFieldComponent label="Item code">
            <div css={Css.dib.red600.$}>1010</div>
          </StaticFieldComponent>
          <StaticFieldComponent label="Item description">
            <div css={Css.nowrap.overflowHidden.add("textOverflow", "ellipsis").w("230px").$}>
              <div css={Css.dib.$}>intacctVendorName- description</div>
            </div>
          </StaticFieldComponent>
          <StaticFieldComponent label="Posted date">
            <div css={Css.mla.$}>01/01/18</div>
          </StaticFieldComponent>
          <StaticFieldComponent label="Amount">
            <div css={Css.mla.$}>$100.00</div>
          </StaticFieldComponent>
        </div>
      </div>
    </div>
  );
}
