import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Css } from "src/Css";
import { SelectedOptionPill } from "src/components/Pills/SelectedOptionPill/SelectedOptionPill";
import { SelectedOptionPillList } from "src/components/Pills/SelectedOptionPill/SelectedOptionPillList";
import { LabeledExamples, newStory } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  title: "Components/Pills/Selected Option Pill",
  component: SelectedOptionPill,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2741-2077",
    },
  },
} as Meta;

export const Examples = newStory(
  () => (
    <LabeledExamples
      labelWidth={140}
      exampleWidth={420}
      examples={[
        { label: "Default", children: <SelectedOptionPill value={optionValue()} onRemove={action("onRemove")} /> },
        {
          label: "With helper text",
          children: (
            <SelectedOptionPill value={optionValue()} helperText={sourcesHelperText()} onRemove={action("onRemove")} />
          ),
        },
        {
          label: "AI mode",
          children: (
            <SelectedOptionPill
              value={optionValue()}
              helperText={sourcesHelperText()}
              onRemove={action("onRemove")}
              aiMode
            />
          ),
        },
        {
          label: "Disabled",
          children: <SelectedOptionPill value={optionValue()} onRemove={action("onRemove")} disabled />,
        },
        {
          label: "Wraps to two lines",
          children: (
            <SelectedOptionPill
              value="CEILBEAM01 Faux Ceiling Beams with reclaimed oak finish for the Living Room"
              onRemove={action("onRemove")}
            />
          ),
        },
        {
          label: "Clamped at two lines",
          children: (
            <SelectedOptionPill
              value="CEILBEAM01 Faux Ceiling Beams with reclaimed oak finish, hand-distressed edges, and matching corbels for the Living Room, Dining Room, and Primary Suite"
              onRemove={action("onRemove")}
            />
          ),
        },
        { label: "List", children: <SelectedOptionPillList options={createOptions()} /> },
      ]}
    />
  ),
  {},
);

function createOptions() {
  return [
    {
      id: "keep",
      value: optionValue("CEILBEAM01", "Faux Ceiling Beams", "Living Room 101"),
      onRemove: action("onRemove keep"),
    },
    {
      id: "ai-add",
      value: optionValue("CAB001", "Upper Cabinets", "Kitchen"),
      helperText: sourcesHelperText(),
      onRemove: action("onRemove ai-add"),
      aiMode: true,
    },
  ];
}

function optionValue(id = "CEILBEAM01", name = "Faux Ceiling Beams", location = "Living Room 101"): ReactNode {
  return (
    <span css={Css.sm.$}>
      {id} <span css={Css.smSb.$}>{name}</span> {location}
    </span>
  );
}

function sourcesHelperText(): ReactNode {
  return (
    <span css={Css.xs.$}>
      Sources:{" "}
      <a href="#page-3" css={Css.blue600.$}>
        Page 3
      </a>
      ,{" "}
      <a href="#page-76" css={Css.blue600.$}>
        Page 76
      </a>
    </span>
  );
}
