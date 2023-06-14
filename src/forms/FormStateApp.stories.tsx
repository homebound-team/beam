import { Meta } from "@storybook/react";
import { FormStateApp as FormStateAppComponent } from "src/forms/FormStateApp";

export default {
  component: FormStateAppComponent,
} as Meta;

export function FormStateApp() {
  return <FormStateAppComponent />;
}
