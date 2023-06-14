import { Meta } from "@storybook/react";
import { HbLoadingSpinner } from "./HbLoadingSpinner";

export default {
  component: HbLoadingSpinner,
} as Meta;

export function DefaultSpinner() {
  return (
    <HbLoadingSpinner
      extraQuips={["Loading..."]}
      // Don't want the snapshot triggeirng changes every time it random's a new quip
      extraQuipsOnly
    />
  );
}

export function IconOnly() {
  return <HbLoadingSpinner iconOnly />;
}
