import { Meta } from "@storybook/react";
import { useMemo, useState } from "react";
import { TextField } from "src/components/TextField";
import { Css } from "src/Css";

export default {
  component: TextField,
  title: "Components/Text Fields",
} as Meta;

export function TextFields() {
  return (
    <div css={Css.df.justifyAround.$}>
      <div>
        <h1 css={Css.lg.mb2.$}>Regular</h1>
        <TextField />
        <br />
        <TextField label="Name" />
        <br />
        <TextField label="Name" defaultValue="Brandon" autoFocus />
        <br />
        <TextField label="Name" defaultValue="Brandon" disabled />
        <br />
        <ValidationTextField value="not a valid email" />
      </div>
      <div>
        <h1 css={Css.lg.mb2.$}>Small</h1>
        <TextField compact />
        <br />
        <TextField compact label="Name" />
        <br />
        <TextField compact label="Name" defaultValue="Brandon" />
        <br />
        <TextField compact label="Name" defaultValue="Brandon" disabled />
        <br />
        <ValidationTextField value="not a valid email" />
      </div>
    </div>
  );
}

function ValidationTextField({ compact, value }: { compact?: boolean; value: string }) {
  const [internalValue, setValue] = useState(value);
  const isValid = useMemo(() => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(internalValue), [internalValue]);

  return (
    <TextField
      compact={compact}
      label="Email"
      value={internalValue}
      onChange={(val) => setValue(val)}
      errorMsg={!isValid ? "The email address entered is invalid. Please provide a valid email address." : undefined}
    />
  );
}
