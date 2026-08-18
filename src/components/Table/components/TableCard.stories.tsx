import { Meta } from "@storybook/react-vite";
import { TableCardView } from "src/components/Table/components/TableCard";
import { Css } from "src/Css";
import { withRouter } from "src/utils/sb";

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
        carousel={{
          title: "8 Variants",
          thumbnails: thumbnails,
        }}
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
        carousel={{
          title: "3 Elevations",
          thumbnails: thumbnails.slice(0, 3),
        }}
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
        carousel={{
          title: "8 Variants",
          thumbnails: thumbnails,
        }}
      />
    </CardContainer>
  );
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
  { id: "mv:1", swatchUrl: "plan-exterior.png", label: "Chrome", to: "/mv/1" },
  { id: "mv:2", swatchUrl: "disposal.png", label: "Matte Black", to: "/mv/2" },
  { id: "mv:3", swatchUrl: "plan-exterior.png", label: "Bronze", to: "/mv/3" },
  { id: "mv:4", swatchUrl: "disposal.png", label: "Nickel", to: "/mv/4" },
  { id: "mv:5", swatchUrl: "plan-exterior.png", label: "Gold", to: "/mv/5" },
  { id: "mv:6", swatchUrl: "disposal.png", label: "Copper", to: "/mv/6" },
  { id: "mv:7", swatchUrl: "plan-exterior.png", label: "White", to: "/mv/7" },
  { id: "mv:8", swatchUrl: "disposal.png", label: "Black", to: "/mv/8" },
];
