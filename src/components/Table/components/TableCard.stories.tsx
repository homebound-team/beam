import { Meta } from "@storybook/react-vite";
import { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { ProposedValue } from "src/components/ProposedValue";
import { TableCardView } from "src/components/Table/components/TableCard";
import { Css, Tokens } from "src/Css";
import { newStory, withRouter } from "src/utils/sb";
import type { PlayFunction } from "storybook/internal/types";
import { userEvent } from "storybook/test";

export default {
  component: TableCardView,
  decorators: [withRouter()],
} as Meta;

export function Default() {
  return (
    <CardContainer>
      <TableCardView imgSrc={imgSrc} title="The Emerson Houston" data={data} />
    </CardContainer>
  );
}

export function WithEyebrowAndBadge() {
  return (
    <CardContainer>
      <TableCardView imgSrc={imgSrc} leftEyebrow="226" title="The Emerson Houston" badge="v23" data={data} />
    </CardContainer>
  );
}

export function WithBadgeTags() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        leftEyebrow="226"
        title="The Emerson Houston"
        badge="v23"
        badgeTags={[
          { text: "New", type: "success" },
          { text: "Info", icon: "infoCircle", iconOnly: true },
        ]}
        data={data}
      />
    </CardContainer>
  );
}

export function WithStatus() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        leftEyebrow="226"
        title="The Emerson Houston"
        badge="v23"
        status={{ text: "Draft", type: "neutral" }}
        data={data}
      />
    </CardContainer>
  );
}

export function AllProps() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        leftEyebrow="226"
        title="The Emerson Houston"
        badge="v23"
        status={{ text: "Draft", type: "neutral" }}
        data={data}
        progress={72}
      />
    </CardContainer>
  );
}

export function LongTitle() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        leftEyebrow="226"
        title="This is a long title example (it can go even longer)"
        badge="v23"
        status={{ text: "Draft", type: "neutral" }}
        data={data}
        progress={72}
      />
    </CardContainer>
  );
}

export function WithCarousel() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead - Polished Chrome"
        leftEyebrow="Kohler"
        rightEyebrow="Shower Faucet"
        status={{ text: "Active", type: "success" }}
        data={[]}
        interactiveFooter={{ kind: "carousel", title: "8 Variants", thumbnails: thumbnails }}
      />
    </CardContainer>
  );
}

export function WithProgressAndCarousel() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        title="The Emerson Houston"
        leftEyebrow="226"
        badge="v23"
        status={{ text: "Draft", type: "neutral" }}
        data={data}
        progress={72}
        height={480}
        interactiveFooter={{ kind: "carousel", title: "3 Elevations", thumbnails: thumbnails.slice(0, 3) }}
      />
    </CardContainer>
  );
}

export function WithContainImageFit() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead - Polished Chrome"
        leftEyebrow="Kohler"
        rightEyebrow="Shower Faucet"
        status={{ text: "Active", type: "success" }}
        data={[]}
        imageFit="contain"
        interactiveFooter={{ kind: "carousel", title: "8 Variants", thumbnails: thumbnails }}
      />
    </CardContainer>
  );
}

export function AiStyling() {
  return (
    <div css={Css.df.gap3.$}>
      <CardContainer>
        <TableCardView
          imgSrc={imgSrc}
          leftEyebrow="002"
          title="H1 - A - Janes Cottage"
          data={createElevationData()}
          progress={72}
        />
      </CardContainer>
      <CardContainer>
        <TableCardView
          imgSrc={imgSrc}
          leftEyebrow="002"
          title="E1 - C - Spanish"
          titleProposed={{ original: "E1 - C - Craftsman" }}
          data={createElevationData({
            height: <ProposedValue original="20" proposed="25 ft" />,
            sqft: <ProposedValue original="3500 - 4500" proposed="4000 - 5000" />,
          })}
          progress={69}
          aiMode
        />
      </CardContainer>
      <CardContainer>
        <TableCardView
          imgSrc={imgSrc}
          leftEyebrow={<ProposedValue proposed="002" />}
          title="I1 - B - Spanish"
          titleProposed={{}}
          data={createElevationData({ allProposed: true })}
          progress={41}
          aiMode
        />
      </CardContainer>
    </div>
  );
}

/**
 * Demonstrates the card's interactive states.
 *
 * The whole card is a single link (or button), and the carousel thumbnails are their own links
 * beside it, so clicking a thumbnail follows the thumbnail rather than the row.
 */
export function Interactive() {
  const { pathname } = useLocation();
  const [rowClicks, setRowClicks] = useState(0);
  return (
    <div css={Css.df.fdc.gap3.$}>
      <div css={Css.df.gap3.$}>
        <CardContainer>
          <TableCardView
            imgSrc={imgSrc}
            leftEyebrow="Kohler"
            rightEyebrow="Shower Faucet"
            title="Forté Showerhead"
            status={{ text: "Active", type: "success" }}
            data={[]}
            to="/plan/1"
            interactiveFooter={{ kind: "carousel", title: "8 Variants", thumbnails }}
            imageFit="contain"
          />
        </CardContainer>
        <CardContainer>
          <TableCardView
            imgSrc={imgSrc}
            leftEyebrow="226"
            title="The Emerson Houston"
            badge="v23"
            data={data.slice(0, 4)}
            progress={72}
            onClick={() => setRowClicks((count) => count + 1)}
          />
        </CardContainer>
      </div>
      <dl css={Css.df.gap3.sm.p2.br8.bgColor(Tokens.SurfaceSubtle).$}>
        <div css={Css.df.gapPx(4).$}>
          <dt>Route:</dt>
          <dd data-testid="route">{pathname}</dd>
        </div>
        <div css={Css.df.gapPx(4).$}>
          <dt>Row clicks:</dt>
          <dd data-testid="rowClicks">{rowClicks}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Tabbing to the card's action rings the whole card, rather than just the action itself. */
export const CardFocused = newStory(() => <FocusStory />, { play: tabPlayFn(1) });

/** ...but tabbing on into a thumbnail rings only that thumbnail, i.e. the card doesn't double-ring. */
export const ThumbnailFocused = newStory(() => <FocusStory />, { play: tabPlayFn(2) });

/** A single interactive card, with few enough thumbnails that the carousel doesn't scroll. */
function FocusStory() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        leftEyebrow="Kohler"
        rightEyebrow="Shower Faucet"
        title="Forté Showerhead"
        data={[]}
        to="/plan/1"
        interactiveFooter={{ kind: "carousel", title: "3 Variants", thumbnails: thumbnails.slice(0, 3) }}
      />
    </CardContainer>
  );
}

/** Tabs `times` times from the top of the canvas, i.e. 1 lands on the card, 2 on its first thumbnail. */
function tabPlayFn(times: number): PlayFunction {
  return async () => {
    for (let i = 0; i < times; i++) {
      await userEvent.tab();
    }
  };
}

/**
 * The elevation blocks from the AI frame. `height` / `sqft` override one value so a card can show a move;
 * `allProposed` marks every value, for a plan the AI put forward whole.
 */
function createElevationData(opts: { height?: ReactNode; sqft?: ReactNode; allProposed?: boolean } = {}) {
  const { height = "25 ft", sqft = "3500 - 4500", allProposed = false } = opts;
  const blocks = [
    { label: "Sqft", value: sqft },
    { label: "Height", value: height },
    { label: "Depth", value: "68 ft" },
    { label: "Width", value: "65 ft" },
  ];
  return allProposed ? blocks.map((b) => ({ ...b, value: <ProposedValue proposed={String(b.value)} /> })) : blocks;
}

function CardContainer({ children }: { children: JSX.Element }) {
  return <div css={Css.wPx(330).$}>{children}</div>;
}

const imgSrc = "plan-exterior.png";
const data = [
  { label: "Sqft", value: "4,274 - 4,496" },
  { label: "Beds", value: "5" },
  { label: "Baths", value: "4" },
  { label: "Elevations", value: "3" },
  { label: "Width", value: "39 - 39.92" },
  { label: "Depth", value: "70.46 - 71" },
];

const thumbnails = [
  { id: "mv:1", imgUrl: "plan-exterior.png", label: "Chrome", to: "/mv/1" },
  { id: "mv:2", imgUrl: "disposal.png", label: "Matte Black", to: "/mv/2" },
  { id: "mv:3", imgUrl: "plan-exterior.png", label: "Bronze", to: "/mv/3" },
  { id: "mv:4", imgUrl: "disposal.png", label: "Nickel", to: "/mv/4" },
  { id: "mv:5", imgUrl: "plan-exterior.png", label: "Gold", to: "/mv/5" },
  { id: "mv:6", imgUrl: "disposal.png", label: "Copper", to: "/mv/6" },
  { id: "mv:7", imgUrl: "plan-exterior.png", label: "White", to: "/mv/7" },
  { id: "mv:8", imgUrl: "disposal.png", label: "Black", to: "/mv/8" },
];
