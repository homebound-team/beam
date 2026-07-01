import { Meta } from "@storybook/react-vite";
import { TableCardView } from "src/components/Table/components/TableCard";
import { Css } from "src/Css";

export default {
  component: TableCardView,
} as Meta;

export function Default() {
  return (
    <CardContainer>
      <TableCardView imgSrc={imgSrc} title="123 Main Street" data={data} />
    </CardContainer>
  );
}

export function WithEyebrowAndBadge() {
  return (
    <CardContainer>
      <TableCardView imgSrc={imgSrc} eyebrow="Lot" title="123 Main Street" badge="Austin, TX" data={data} />
    </CardContainer>
  );
}

export function WithBadgeTags() {
  return (
    <TableCardView
      imgSrc={imgSrc}
      eyebrow="Lot"
      title="123 Main Street"
      badge="Austin, TX"
      badgeTags={[
        { text: "New", type: "success" },
        { text: "Info", icon: "infoCircle", iconOnly: true },
      ]}
      data={data}
    />
  );
}

export function WithStatus() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        eyebrow="Home"
        title="123 Main Street"
        badge="Austin, TX"
        status={{ text: "In Progress", type: "caution" }}
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
        eyebrow="Home"
        title="123 Main Street"
        badge="Austin, TX"
        status={{ text: "Archived", type: "warning" }}
        data={data}
        progress={65}
      />
    </CardContainer>
  );
}

export function LongTitle() {
  return (
    <CardContainer>
      <TableCardView
        imgSrc={imgSrc}
        eyebrow="Home"
        title="This is a long title example"
        badge="Austin, TX"
        status={{ text: "Archived", type: "warning" }}
        data={data}
        progress={65}
      />
    </CardContainer>
  );
}

function CardContainer({ children }: { children: JSX.Element }) {
  return <div css={Css.wPx(280).$}>{children}</div>;
}

const imgSrc = "plan-exterior.png";
const data = [
  { label: "Sq Ft", value: "2,400" },
  { label: "Beds", value: "4" },
  { label: "Baths", value: "3" },
  { label: "Close Date", value: "Aug 2026" },
];
