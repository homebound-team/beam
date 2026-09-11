import type { Meta } from "@storybook/react-vite";
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
        { label: "Complete", count: 40, status: "success" },
        { label: "In Progress", count: 32, status: "neutral" },
        { label: "Incomplete", count: 9, status: "warning" },
        { label: "Missing", count: 4, status: "error" },
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
        { label: "Complete", count: 0, status: "success" },
        { label: "Missing", count: 0, status: "error" },
      ]}
    />
  );
}
