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

export function WithAutoSave() {
  return (
    <ContentHeader
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      withAutoSave
      actions={[{ label: "Add", onClick: () => {} }]}
    />
  );
}

/** `level={3}` is the `FormSection` heading — `h3` / `lg`. Default `level={2}` is `h2` / `xl`. */
export function Level3() {
  return (
    <ContentHeader
      title="General Contractor"
      description="The primary contractor responsible for this project."
      level={3}
      actions={[{ label: "Add", onClick: () => {} }]}
    />
  );
}

/** `level={4}` is the `FormSectionChild` heading — `h4` / `mdSb`. */
export function Level4() {
  return (
    <ContentHeader
      title="Electrical"
      description="Electrical contracts are needed for the construction to continue."
      level={4}
      actions={[{ label: "Add", onClick: () => {} }]}
    />
  );
}
