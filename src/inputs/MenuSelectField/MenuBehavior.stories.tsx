import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "src/components/Button";
import { ModalBody, ModalHeader } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { Css } from "src/Css";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { optionItems } from "src/inputs/MenuSelectField/storyOptions";
import { newStory, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";
import { waitFor, within } from "storybook/test";

export default {
  title: "Inputs/Select Fields (new)/Menu Behavior",
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2828-5144",
    },
  },
} as Meta;

/** Options load the first time the menu opens. The closed field labels the current value before that. */
export const LazyLoaded = newStory(
  () => {
    const items = optionItems();
    const [value, setValue] = useState<string | undefined>("o4");
    const [loaded, setLoaded] = useState<ReturnType<typeof optionItems> | undefined>();
    return (
      <FieldFrame>
        <MenuSelectField
          label="Options"
          value={value}
          onSelect={setValue}
          options={{
            current: items.find((option) => option.id === "o4"),
            load: async () => {
              await new Promise((resolve) => setTimeout(resolve, 600));
              setLoaded(items);
            },
            options: loaded,
          }}
        />
      </FieldFrame>
    );
  },
  {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      canvas.getByTestId("options").click();
      // Wait until a row that was not in `current` is painted, so the snapshot is the loaded list.
      await waitFor(() => canvas.getByText("Add Hand Shower - Primary Bath 205"));
    },
  },
);

/** The menu opens upward when the field sits at the bottom of the viewport. */
export const FlipsUpward = newStory(
  () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <FieldFrame pin="end">
        <MenuSelectField label="Location" options={optionItems()} value={value} onSelect={setValue} />
      </FieldFrame>
    );
  },
  { play: open("location") },
);

/** The same popover, anchored inside a modal. */
export const InModal = newStory(
  () => {
    const { openModal } = useModal();
    const openModalSelect = () => openModal({ content: <ModalSelect /> });
    useEffect(openModalSelect, [openModal]);
    return <Button label="Open modal" onClick={openModalSelect} />;
  },
  {
    play: async () => {
      // Modal content is portaled outside the story canvas.
      const body = within(document.body);
      await waitFor(() => body.getByTestId("options"));
      body.getByTestId("options").click();
    },
  },
);

function ModalSelect() {
  const [value, setValue] = useState<string | undefined>();
  return (
    <>
      <ModalHeader>Select in a modal</ModalHeader>
      <ModalBody>
        <MenuSelectField label="Options" options={optionItems()} value={value} onSelect={setValue} />
      </ModalBody>
    </>
  );
}

function FieldFrame(props: { children: ReactNode; pin?: "end" }) {
  return (
    <div css={Css.df.fdc.p2.if(props.pin === "end").h("100vh").jcfe.$}>
      <div css={Css.wPx(320).$}>{props.children}</div>
    </div>
  );
}

function open(testId: string) {
  return ({ canvasElement }: { canvasElement: HTMLElement }) => {
    within(canvasElement).getByTestId(testId).click();
  };
}
