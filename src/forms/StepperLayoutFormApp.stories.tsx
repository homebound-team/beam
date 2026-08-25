import { Meta } from "@storybook/react-vite";
import { StepperLayoutFormApp as StepperLayoutFormAppComponent } from "src/forms/StepperLayoutFormApp";
import { withBeamDecorator, withRouter } from "src/utils/sb";

export default {
  component: StepperLayoutFormAppComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function StepperLayoutFormApp() {
  return <StepperLayoutFormAppComponent />;
}
