import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { TableCard as TableCardComponent } from "./TableCard";

export default {
  component: TableCardComponent,
} as Meta;

// TODO: show states in a single story, i.e. hovver, disabled, menu open, etc.
export function PlanCard() {
  return (
    <TableCardComponent
      title="The Conroy"
      subtitle="SFH-001"
      detailContent={planDetailsComponent}
      type="card"
      imgSrc="plan-exterior.png"
      imageFit="cover"
      tag={{ text: "Active", type: "success" }}
    />
  );
}

export function BorderlessCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      detailContent={detailsComponent}
      type="card"
      bordered={false}
      imgSrc="disposal.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      detailContent={detailsComponent}
      type="card"
      bordered={true}
      imgSrc="disposal.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedCardDisabled() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      detailContent={detailsComponent}
      type="card"
      bordered={true}
      disabled={true}
      imgSrc="disposal.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedlessListCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      detailContent={detailsComponent}
      type="list"
      bordered={false}
      imgSrc="disposal.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedListCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      detailContent={detailsComponent}
      type="list"
      bordered={true}
      imgSrc="disposal.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

const planDetailsComponent = (
  <div css={Css.gray700.sm.$}>
    <div>4,000 - 5,000sf</div>
    <div>5-6bd / 5.5ba</div>
    <div>3 Elevations / 18 Options</div>
    <div css={Css.tiny.pt1.$}>Last Update 08/14/24</div>
  </div>
);

const detailsComponent = (
  <div css={Css.gray700.tiny.$}>
    <div>Model: VR12</div>
    <div>Code: PL-AIRSW-INSN-7900</div>
  </div>
);

const buttonMenuItems = [
  { label: "View", onClick: () => console.log("View") },
  { label: "Edit", onClick: () => console.log("Edit") },
  { label: "Delete", onClick: () => console.log("Delete") },
];
