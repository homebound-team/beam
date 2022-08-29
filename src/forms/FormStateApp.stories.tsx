import { Meta } from "@storybook/react";
import { FormStateApp as FormStateAppComponent } from "src/forms/FormStateApp";

export default {
  component: FormStateAppComponent,
  title: "Forms/Form State App",
} as Meta;

export function FormStateApp() {
  return <FormStateAppComponent />;
}
