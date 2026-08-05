import { Meta } from "@storybook/react-vite";
import { WorkflowLayoutFormApp as WorkflowLayoutFormAppComponent } from "src/forms/WorkflowLayoutFormApp";
import { withBeamDecorator, withRouter } from "src/utils/sb";

export default {
  component: WorkflowLayoutFormAppComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function WorkflowLayoutFormApp() {
  return <WorkflowLayoutFormAppComponent />;
}
