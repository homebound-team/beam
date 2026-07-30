import { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { withBeamDecorator } from "src/utils/sb";

export default {
  component: ContentHeader,
  decorators: [withBeamDecorator],
} as Meta;

export function Default() {
  return (
    <ContentHeader
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      actions={<Button label="Add" onClick={() => {}} />}
    />
  );
}

export function TitleOnly() {
  return <ContentHeader title="Trade Partners" />;
}

export function DescriptionAndActions() {
  return (
    <ContentHeader
      description="Assign and manage trade partners for this project."
      actions={<Button label="Add" onClick={() => {}} />}
    />
  );
}
