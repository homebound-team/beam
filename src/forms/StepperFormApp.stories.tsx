import { Meta } from "@storybook/react-vite";
import { StepperFormApp as StepperFormAppComponent } from "src/forms/StepperFormApp";

export default {
  component: StepperFormAppComponent,
} as Meta;

export function StepperFormApp() {
  return <StepperFormAppComponent />;
}
