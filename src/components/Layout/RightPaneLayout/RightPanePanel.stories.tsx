import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { AiSlimBanner } from "src/components/AiSlimBanner";
import { Css, Tokens } from "src/Css";
import { withBeamDecorator, zeroTo } from "src/utils/sb";
import { action } from "storybook/actions";
import { RightPaneBanner, RightPanePanel, type RightPanePanelProps } from "./RightPanePanel";

export default {
  component: RightPanePanel,
  decorators: [withBeamDecorator],
} satisfies Meta;

/** Side Panel footer variations. Frames shrink with the viewport; the 380px one compacts `Delete (3)` to `(3)`. */
export function FooterVariations() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      <PanelFrame
        title="Install Doors & Trim"
        deleteAction={{ onClick: action("delete") }}
        secondaryAction={createCancel()}
        primaryAction={{ label: "Save", onClick: action("save") }}
        longBody
      />
      <PanelFrame
        title="Changes"
        secondaryAction={createCancel()}
        primaryAction={{ label: "Save", onClick: action("save") }}
      />
      <PanelFrame
        title="Add Material"
        deleteAction={{ onClick: action("delete") }}
        secondaryAction={createCancel()}
        primaryAction={{ label: "Add", onClick: action("add"), disabled: true }}
      />
      <PanelFrame
        title="Install Doors & Trim"
        deleteAction={{ onClick: action("delete") }}
        secondaryAction={createCancel()}
        primaryAction={{ label: "Save AI Changes", variant: "ai", onClick: action("save") }}
      />
      <PanelFrame
        title="Bulk Edit"
        deleteAction={{ onClick: action("delete"), count: 3 }}
        secondaryAction={createCancel()}
        primaryAction={{ label: "Save", onClick: action("save") }}
      />
      <PanelFrame
        title="Bulk Edit"
        width={380}
        deleteAction={{ onClick: action("delete"), count: 3 }}
        secondaryAction={createCancel()}
        primaryAction={{ label: "Save AI Changes", variant: "ai", onClick: action("save") }}
      />
    </div>
  );
}

/** Side Panel header variations: optional type or status tag, banner, and a title clamped to 2 lines. */
export function HeaderVariations() {
  return (
    <div css={Css.df.fdc.gap3.$}>
      <PanelFrame title="Install Doors & Trim" tag={{ icon: "wrench", text: "Labor" }} height={200} />
      <PanelFrame title="Kitchen Cabinets" tag={{ kind: "status", text: "Draft", type: "warning" }} height={200} />
      <PanelFrame title="Bulk Edit" height={160} />
      <PanelFrame title="Changes" height={160} />
      <PanelFrame
        title="Install Doors & Trim"
        tag={{ icon: "wrench", text: "Labor" }}
        banner={
          <AiSlimBanner
            title="Review 6 Suggested Changes"
            action={{ label: "Ignore All", onClick: action("ignoreAll") }}
          />
        }
        height={240}
      />
      <PanelFrame
        title="Install Interior Doors, Casing, Baseboard & Crown Molding Throughout the Second Floor Bedrooms"
        tag={{ icon: "wrench", text: "Labor" }}
        width={380}
        height={220}
      />
    </div>
  );
}

function PanelFrame(
  props: Omit<RightPanePanelProps, "children"> & {
    width?: number;
    height?: number;
    longBody?: boolean;
    banner?: ReactNode;
  },
) {
  const { width = 450, height = 480, longBody = false, banner, ...panelProps } = props;
  return (
    <div css={Css.w100.maxwPx(width).hPx(height).bl.bt.bc(Tokens.SurfaceSeparator).bgColor(Tokens.Surface).$}>
      <RightPanePanel {...panelProps}>
        {banner && <RightPaneBanner>{banner}</RightPaneBanner>}
        {zeroTo(longBody ? 30 : 3).map((i) => (
          <p key={i} css={Css.sm.color(Tokens.OnSurfaceMuted).mb1.$}>
            Body row {i + 1}
          </p>
        ))}
      </RightPanePanel>
    </div>
  );
}

function createCancel(): RightPanePanelProps["secondaryAction"] {
  return { label: "Cancel", onClick: action("cancel") };
}
