import { Meta } from "@storybook/react-vite";
import { Css, Properties } from "src/Css";
import { userEvent, waitFor, within } from "storybook/test";
import { Placement, Tooltip } from "./Tooltip";

export default {
  component: Tooltip,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36259%3A103869",
    },
  },
} as Meta;

export function TooltipPlacements() {
  const placements: Placement[] = ["auto", "bottom", "left", "right", "top"];
  return (
    <div css={Css.w25.ml("25%").$}>
      {placements.map((placement, i) => (
        <Tooltip title="Tooltip Info" placement={placement} key={i}>
          <span css={Css.db.tac.my5.bgGray400.br4.$}>
            This tooltip is positioned at: <span css={Css.fwb.$}>{placement}</span>
          </span>
        </Tooltip>
      ))}
    </div>
  );
}

export function TooltipDisabled() {
  return (
    <Tooltip title="Tooltip Info" disabled={true}>
      <span css={Css.db.tac.my5.bgGray400.br4.$}>Content</span>
    </Tooltip>
  );
}

// Renders a single edge/corner-pinned tooltip and forces it open. Each corner is its own story so
// Chromatic captures every overflow case (only one tooltip is ever shown at a time).
function cornerStory(label: string, corner: Properties, placement?: Placement) {
  // Intentionally long so that, when the trigger is pinned to a viewport edge, the tooltip would
  // overflow (and introduce scrollbars) if positioning were not viewport-aware.
  const longContent =
    "This is an intentionally long tooltip so that, when its trigger is pinned to a viewport edge, " +
    "the tooltip would overflow the viewport if positioning were not viewport-aware.";

  function Story() {
    return (
      <div css={Css.fixed.add("inset", 0).$}>
        {/* `corner` is a runtime value, so it goes through `style` rather than truss's build-time `add`. */}
        <div css={Css.absolute.$} style={corner}>
          <Tooltip title={longContent} placement={placement}>
            <span css={Css.dib.p1.bgGray400.br4.$}>{label}</span>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Force the (only) tooltip on the canvas to open so Chromatic snapshots it. The trigger span is
  // tagged with `data-testid="tooltip"` via the component's `useTestIds`.
  Story.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    return waitFor(() => userEvent.hover(canvas.getByTestId("tooltip")));
  };
  return Story;
}

export const TooltipViewportTopLeft = cornerStory("Top-left", { top: 0, left: 0 }, "top");
export const TooltipViewportTopRight = cornerStory("Top-right", { top: 0, right: 0 }, "right");
export const TooltipViewportBottomLeft = cornerStory("Bottom-left", { bottom: 0, left: 0 }, "left");
export const TooltipViewportBottomRight = cornerStory("Bottom-right", { bottom: 0, right: 0 }, "bottom");
