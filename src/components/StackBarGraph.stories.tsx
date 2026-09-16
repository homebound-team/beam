import type { Meta } from "@storybook/react-vite";
import { Palette } from "src/Css";
import { StackBarGraph } from "src/components/StackBarGraph";

export default {
  component: StackBarGraph,
} as Meta;

export function Default() {
  return (
    <StackBarGraph
      title="Coverage by status"
      totalLabel="Cost Codes"
      segments={[
        { label: "Complete", count: 40, color: Palette.Green500 },
        { label: "In Progress", count: 32, color: Palette.Gray500 },
        { label: "Incomplete", count: 9, color: Palette.Orange500 },
        { label: "Missing", count: 4, color: Palette.Red500 },
      ]}
    />
  );
}

export function ZeroTotal() {
  return (
    <StackBarGraph
      title="Coverage by status"
      totalLabel="Cost Codes"
      segments={[
        { label: "Complete", count: 0, color: Palette.Green500 },
        { label: "Missing", count: 0, color: Palette.Red500 },
      ]}
    />
  );
}
