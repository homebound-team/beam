import { Meta } from "@storybook/react-vite";
import { TableCardView } from "src/components/Table/components/TableCard";
import { Css } from "src/Css";

export default {
  component: TableCardView,
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
      <TableCardView imgSrc={imgSrc} eyebrow="226" title="The Emerson Houston" badge="v23" data={data} />
    </CardContainer>
  );
}

export function WithBadgeTags() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        eyebrow="226"
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
        eyebrow="226"
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
        eyebrow="226"
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
        eyebrow="226"
        title="This is a long title example (it can go even longer)"
        badge="v23"
        status={{ text: "Draft", type: "neutral" }}
        data={data}
        progress={72}
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
