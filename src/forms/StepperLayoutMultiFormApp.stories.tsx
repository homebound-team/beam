import { Meta } from "@storybook/react-vite";
import { StepperLayoutMultiFormApp as StepperLayoutMultiFormAppComponent } from "src/forms/StepperLayoutMultiFormApp";
import { withBeamDecorator, withRouter } from "src/utils/sb";

export default {
  component: StepperLayoutMultiFormAppComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function StepperLayoutMultiFormApp() {
  return <StepperLayoutMultiFormAppComponent />;
}
