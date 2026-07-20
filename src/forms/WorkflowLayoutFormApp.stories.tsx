import { Meta } from "@storybook/react-vite";
import { WorkflowLayoutFormApp as WorkflowLayoutFormAppComponent } from "src/forms/WorkflowLayoutFormApp";

export default {
  component: WorkflowLayoutFormAppComponent,
  parameters: { layout: "fullscreen" },
} as Meta;

export function WorkflowLayoutFormApp() {
  return <WorkflowLayoutFormAppComponent />;
}
