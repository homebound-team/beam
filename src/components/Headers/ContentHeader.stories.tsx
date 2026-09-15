import type { Meta } from "@storybook/react-vite";
import { ContentHeader } from "src/components/Headers/ContentHeader";
import { Css } from "src/Css";
import { newStory, viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";

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

/** `keepVisible` actions stay in the bottom slot at `sm`; other actions stay in the right slot. */
export const WithKeepVisible = newStory(
  () => (
    <ContentHeader
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      actions={[
        {
          kind: "menu",
          keepVisible: true,
          trigger: { label: "Plan Cycle · In Progress", variant: "secondary", colorScheme: "info" },
          items: [
            { label: "Mark Complete", onClick: action("complete") },
            { label: "Reset Cycle", onClick: action("reset"), destructive: true },
          ],
        },
        { label: "Add", onClick: () => {} },
      ]}
    />
  ),
  { parameters: { chromatic: { modes: viewportModes("desktop", "mobile1") } }, decorators: [withRouter()] },
);

/** Overflow / more-actions `ButtonMenu` via `kind: "menu"` (always a `verticalDots` trigger). */
export const WithOverflowMenu = newStory(
  () => (
    <ContentHeader
      title="Trade Partners"
      description="Assign and manage trade partners for this project."
      actions={[
        { label: "Add", onClick: () => {} },
        { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
        {
          kind: "menu",
          defaultOpen: true,
          trigger: { icon: "verticalDots", variant: "outline" },
          items: [
            { label: "Export", onClick: () => {} },
            { label: "Archive", onClick: () => {} },
          ],
        },
      ]}
    />
  ),
  { decorators: [withRouter()] },
);
