import type { ReactNode } from "react";
import { Css } from "src/Css";
import type { NestedOption } from "src/inputs/TreeSelectField/utils";
import { within } from "storybook/test";

export function groupByOptions() {
  return [
    { id: "cc", name: "Cost Code" },
    { id: "cd", name: "Cost Division" },
    { id: "feature", name: "Feature" },
    { id: "level", name: "Level" },
    { id: "location", name: "Location" },
    { id: "option", name: "Option" },
    { id: "room", name: "Room" },
    { id: "task", name: "Task" },
    { id: "trade", name: "Trade" },
  ];
}

export function optionItems() {
  return [
    { id: "o1", name: "Accent Wall Tile Upgrade - Powder Room 110", code: "ADDHNDSHWR" },
    { id: "o2", name: "Add Hand Shower - Primary Bath 205", code: "ADDHNDSHWR" },
    { id: "o3", name: "Add Outdoor Cameras - Building", code: "ADDODCAM01" },
    { id: "o4", name: "Add Speakers to 5.1 Surround - Great Room 109", code: "ADDSPKR" },
    { id: "o5", name: "Add Speakers to 5.1 Surround - Loft 201", code: "ADDSPKR" },
    { id: "o6", name: "Convert Bathtub to Shower", code: "BATH2SHW01" },
    { id: "o7", name: "Slab Backsplash Upgrade - Kitchen 106", code: "BSPLHCT001" },
    { id: "o8", name: "Add Dry Bar with Undercounter Refrigerator", code: "CABBARDRY2" },
    { id: "o9", name: "Add Cabinet Bench at Fireplace - Great Room", code: "CABBNCHFP1" },
    { id: "o10", name: "Add Cabinets with Windows at Dining Room", code: "CABDIN02" },
    { id: "o11", name: "Casual Dining 107", code: "LOC107" },
    { id: "o12", name: "Covered Patio 108", code: "LOC108" },
    { id: "o13", name: "Every Day Entry 111", code: "LOC111" },
    { id: "o14", name: "Foyer 102", code: "LOC102" },
  ];
}

export type OptionTreeItem = { id: string; name: string; code?: string };

/** Options grouped by code, as in the tree select design. */
export function optionTreeItems(): NestedOption<OptionTreeItem>[] {
  return [
    { id: "o1", name: "Accent Wall Tile Upgrade - Powder Room 110", code: "ADDHNDSHWR" },
    { id: "o2", name: "Add Hand Shower - Primary Bath 205", code: "ADDHNDSHWR" },
    { id: "o3", name: "Add Outdoor Cameras - Building", code: "ADDODCAM01" },
    {
      id: "spkr",
      name: "Add Speakers to 5.1 Surround",
      code: "ADDSPKR",
      children: [
        { id: "spkr-109", name: "Add Speakers to 5.1 Surround - Great Room 109" },
        { id: "spkr-201", name: "Add Speakers to 5.1 Surround - Loft 201" },
        { id: "spkr-205", name: "Add Speakers to 5.1 Surround - Primary Bath 205" },
        { id: "spkr-202", name: "Add Speakers to 5.1 Surround - Primary Bath 202" },
      ],
    },
    {
      id: "bath",
      name: "Convert Bathtub to Shower",
      code: "BATH2SHW01",
      children: [
        { id: "bath-205", name: "Convert Bathtub to Shower - Primary Bath 205" },
        { id: "bath-202", name: "Convert Bathtub to Shower - Primary Bath 202" },
        { id: "bath-210", name: "Convert Bathtub to Shower - Bath 210" },
      ],
    },
    { id: "o7", name: "Slab Backsplash Upgrade - Kitchen 106", code: "BSPLHCT001" },
    { id: "o8", name: "Add Dry Bar with Undercounter Refrigerator - Loft 201", code: "CABBARDRY2" },
    { id: "o9", name: "Add Cabinet Bench at Fireplace - Great Room 109", code: "CABBNCHFP1" },
    {
      id: "din",
      name: "Add Cabinets with Windows at Dining Room",
      code: "CABDIN02",
      children: [
        {
          id: "din-l",
          name: "Left Wall",
          children: [
            { id: "din-l-upper", name: "Left Wall - Upper Cabinets" },
            { id: "din-l-lower", name: "Left Wall - Lower Cabinets" },
          ],
        },
        { id: "din-r", name: "Right Wall" },
      ],
    },
  ];
}

/** Menu row for `optionTreeItems`: the code, then the name in semibold. Wraps instead of truncating. */
export function optionTreeLabel(option: OptionTreeItem): ReactNode {
  return (
    <span>
      {option.code && <span css={Css.mr1.$}>{option.code}</span>}
      <span css={Css.smSb.$}>{option.name}</span>
    </span>
  );
}

type FieldFrameProps = {
  children: ReactNode;
  /** Pin the field to the bottom of the viewport so the menu opens upward. */
  pin?: "end";
};

/** Padded frame for menu stories. */
export function FieldFrame(props: FieldFrameProps) {
  return (
    <div css={Css.p2.if(props.pin === "end").df.fdc.h("100vh").jcfe.$}>
      <div css={Css.wPx(320).$}>{props.children}</div>
    </div>
  );
}

/** Storybook play that opens a menu by its test id. */
export function open(testId: string) {
  return ({ canvasElement }: { canvasElement: HTMLElement }) => {
    within(canvasElement).getByTestId(testId).click();
  };
}
