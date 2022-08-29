import { Meta } from "@storybook/react";
import { StepperFormApp as StepperFormAppComponent } from "src/forms/StepperFormApp";

export default {
  component: StepperFormAppComponent,
  title: "Forms/Stepper Form App",
} as Meta;

export function StepperFormApp() {
  return <StepperFormAppComponent />;
}