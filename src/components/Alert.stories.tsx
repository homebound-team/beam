import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { Alert, Css } from "src/index";

export default {
  component: Alert,
  title: "Components/Alert",
} as Meta;

export function DefaultAlert() {
  return (
    <div css={Css.df.fdc.childGap3.$}>
      <Alert onClose={action("close")}>
        <span css={Css.b.$}>Holy Smokes!</span>
        &nbsp;
        <span>Something seriously bad happened.</span>
      </Alert>
      {/* An example with an error message that wraps. */}
      <Alert onClose={action("close")}>
        <div css={Css.b.$}>Holy Smokes!</div>
        <div>Something seriously bad happened.</div>
      </Alert>
      <Alert onClose={action("close")}>Something seriously bad happened.</Alert>
    </div>
  );
}
