import type { Meta } from "@storybook/react-vite";
import { Css, Tokens } from "src/Css";
import { withBeamDecorator, zeroTo } from "src/utils/sb";
import { action } from "storybook/actions";
import { RightPanePanel, type RightPanePanelProps } from "./RightPanePanel";

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

function PanelFrame(props: Omit<RightPanePanelProps, "children"> & { width?: number; longBody?: boolean }) {
  const { width = 450, longBody = false, ...panelProps } = props;
  return (
    <div css={Css.w100.maxwPx(width).hPx(480).bl.bt.bc(Tokens.SurfaceSeparator).bgColor(Tokens.Surface).$}>
      <RightPanePanel {...panelProps}>
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
