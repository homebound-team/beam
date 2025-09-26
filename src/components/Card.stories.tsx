import { Meta } from "@storybook/react";
import { userEvent, waitFor, within } from "@storybook/test";
import { PlayFunction } from "@storybook/types";
import { Css, Properties } from "src/Css";
import { newStory } from "src/utils/sb";
import { Card as CardComponent, CardProps } from "./Card";

export default {
  component: CardComponent,
} as Meta;

const planDetailsComponent = (
  <div css={Css.gray700.sm.$}>
    <div>4,000 - 5,000sf</div>
    <div>5-6bd / 5.5ba</div>
    <div>3 Elevations / 18 Options</div>
    <div css={Css.xs2.pt1.$}>Last Update 08/14/24</div>
  </div>
);

const detailsComponent = (
  <div css={Css.gray700.xs2.$}>
    <div>Model: VR12</div>
    <div>Code: PL-AIRSW-INSN-7900</div>
  </div>
);

const buttonMenuItems = [
  { label: "View", onClick: () => console.log("View") },
  { label: "Edit", onClick: () => console.log("Edit") },
  { label: "Delete", onClick: () => console.log("Delete") },
];

const baseArgs = {
  title: "Badger 5 Garbage Disposal 1/2 HP with Power Cord",
  subtitle: "Insinkerator",
  detailContent: detailsComponent,
  imgSrc: "disposal.png",
  buttonMenuItems: buttonMenuItems,
};

export const PlanCard = createCardStory(
  {
    title: "The Conroy",
    subtitle: "SFH-001",
    detailContent: planDetailsComponent,
    type: "card",
    imgSrc: "plan-exterior.png",
    imageFit: "cover",
    tag: { text: "Active", type: "success" },
  },
  hoverPlayFn({ click: false }),
);

export const BorderlessCard = createCardStory(
  { ...baseArgs, type: "card", bordered: false },
  hoverPlayFn({ click: true }),
);

export const BorderedCard = createCardStory(
  { ...baseArgs, type: "card", bordered: true },
  hoverPlayFn({ click: true }),
);

export const BorderlessListCard = createCardStory(
  { ...baseArgs, type: "list", bordered: false },
  hoverPlayFn({ click: true }),
  { ...Css.fdc.$ },
);

export const BorderedListCard = createCardStory(
  { ...baseArgs, type: "list", bordered: true },
  hoverPlayFn({ click: true }),
  { ...Css.fdc.$ },
);

function hoverPlayFn({ click: shouldClick }: { click: boolean }): PlayFunction {
  return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const hoverElement = canvas.getByTestId("hover");
    return waitFor(async () => {
      await userEvent.hover(within(hoverElement).getByTestId("card"));
      if (shouldClick) {
        await userEvent.click(canvas.getByTestId("verticalDots"));
      }
    });
  };
}

function createCardStory(args: CardProps, hoverPlayFn?: PlayFunction, css?: Properties) {
  return newStory(
    () => (
      <div css={{ ...Css.df.gap5.$, ...css }}>
        <div>
          <h2>Default</h2>
          <CardComponent {...args} />
        </div>
        <div data-testid="hover">
          <h2>Hovered and Menu Clicked</h2>
          <CardComponent {...args} />
        </div>
        <div data-testid="disabled">
          <h2>Disabled</h2>
          <CardComponent {...args} disabled />
        </div>
      </div>
    ),
    { play: hoverPlayFn },
  );
}
