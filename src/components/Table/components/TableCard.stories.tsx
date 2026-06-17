import { Meta } from "@storybook/react-vite";
import { TableCard } from "src/components/Table/components/TableCard";

export default {
  component: TableCard,
} as Meta;

const imgSrc = "https://placehold.co/300x200";
const data = [
  { header: "Sq Ft", value: "2,400" },
  { header: "Beds", value: "4" },
  { header: "Baths", value: "3" },
  { header: "Close Date", value: "Aug 2026" },
];

export function Default() {
  return <TableCard imgSrc={imgSrc} title="123 Main Street" data={data} />;
}

export function WithEyebrowAndBadge() {
  return <TableCard imgSrc={imgSrc} eyebrow="Lot" title="123 Main Street" badge="Austin, TX" data={data} />;
}

export function WithStatus() {
  return (
    <TableCard
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
    <TableCard
      imgSrc={imgSrc}
      eyebrow="Home"
      title="123 Main Street"
      badge="Austin, TX"
      status={{ text: "Archived", type: "warning" }}
      data={data}
      progress={{ label: "Construction", value: 65, minValue: 0, maxValue: 100 }}
    />
  );
}
