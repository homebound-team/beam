import { Meta } from "@storybook/react-vite";
import { StepperLayoutFormApp as StepperLayoutFormAppComponent } from "src/forms/StepperLayoutFormApp";

export default {
  component: StepperLayoutFormAppComponent,
  parameters: { layout: "fullscreen" },
} as Meta;

export function StepperLayoutFormApp() {
  return <StepperLayoutFormAppComponent />;
}
