import { Meta } from "@storybook/react-vite";
import { TableCardView } from "src/components/Table/components/TableCard";

export default {
  component: TableCardView,
} as Meta;

const imgSrc = "plan-exterior.png";
const data = [
  { header: "Sq Ft", value: "2,400" },
  { header: "Beds", value: "4" },
  { header: "Baths", value: "3" },
  { header: "Close Date", value: "Aug 2026" },
];

export function Default() {
  return <TableCardView imgSrc={imgSrc} title="123 Main Street" data={data} />;
}

export function WithEyebrowAndBadge() {
  return <TableCardView imgSrc={imgSrc} eyebrow="Lot" title="123 Main Street" badge="Austin, TX" data={data} />;
}

export function WithStatus() {
  return (
    <TableCardView
      imgSrc={imgSrc}
      eyebrow="Home"
      title="123 Main Street"
      badge="Austin, TX"
      status={{ text: "In Progress", type: "caution" }}
      data={data}
    />
  );
}

export function AllProps() {
  return (
    <TableCardView
      imgSrc={imgSrc}
      eyebrow="Home"
      title="123 Main Street"
      badge="Austin, TX"
      status={{ text: "Archived", type: "warning" }}
      data={data}
      progress={65}
    />
  );
}

export function LongTitle() {
  return (
    <TableCardView
      imgSrc={imgSrc}
      eyebrow="Home"
      title="This is a long title example"
      badge="Austin, TX"
      status={{ text: "Archived", type: "warning" }}
      data={data}
      progress={65}
    />
  );
}
