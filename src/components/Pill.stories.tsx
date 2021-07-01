import { Meta } from "@storybook/react";
import { Pill } from "src/components/Pill";

export default {
  component: Pill,
  title: "Components/Pill",
} as Meta;

export function DefaultPill() {
  return (
    <div>
      <Pill text="First Last" />
    </div>
  );
}
