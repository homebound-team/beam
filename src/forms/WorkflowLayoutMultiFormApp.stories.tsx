import { Meta } from "@storybook/react-vite";
import { WorkflowLayoutMultiFormApp as WorkflowLayoutMultiFormAppComponent } from "src/forms/WorkflowLayoutMultiFormApp";
import { withBeamDecorator, withRouter } from "src/utils/sb";

export default {
  component: WorkflowLayoutMultiFormAppComponent,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

export function WorkflowLayoutMultiFormApp() {
  return <WorkflowLayoutMultiFormAppComponent />;
}
