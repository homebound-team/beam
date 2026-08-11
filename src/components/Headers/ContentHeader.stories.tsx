import { Meta } from "@storybook/react-vite";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Css } from "src/Css";
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
      actions={[{ label: "Add", onClick: () => {} }]}
    />
  );
}

export function TitleOnly() {
  return <ContentHeader title="Trade Partners" />;
}

/** `xss` accepts padding-only overrides, i.e. to inset the header from its container. */
export function WithPadding() {
  return (
    <ContentHeader
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      actions={[{ label: "Add", onClick: () => {} }]}
      xss={Css.px3.py2.$}
    />
  );
}

export function DescriptionAndActions() {
  return (
    <ContentHeader
      description="Assign and manage trade partners for this project."
      actions={[{ label: "Add", onClick: () => {} }]}
    />
  );
}
