import { Meta } from "@storybook/react";
import { FormStateApp } from "src/forms/FormStateApp";

export default {
  component: FormStateApp,
  title: "Forms/Form State App",
} as Meta;

export function Example() {
  return <FormStateApp />;
}
