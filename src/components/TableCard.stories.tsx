import { Meta } from "@storybook/react";
import { Css } from "src/Css";
import { TableCard as TableCardComponent } from "./TableCard";

export default {
  component: TableCardComponent,
} as Meta;

// TODO: show states in a single story
export function PlanCard() {
  return (
    <TableCardComponent
      title="The Conroy"
      subtitle="SFH-001"
      metadata={planMetadataComponent}
      type="card"
      image="src/images/plan.png"
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
      metadata={metadataComponent}
      type="card"
      bordered={false}
      image="src/images/card-image.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      metadata={metadataComponent}
      type="card"
      bordered={true}
      image="src/images/card-image.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedCardDisabled() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      metadata={metadataComponent}
      type="card"
      bordered={true}
      disabled={true}
      image="src/images/card-image.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedlessListCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      metadata={metadataComponent}
      type="list"
      bordered={false}
      image="src/images/card-image.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

export function BorderedListCard() {
  return (
    <TableCardComponent
      title="Badger 5 Garbage Disposal 1/2 HP with Power Cord"
      subtitle="Insinkerator"
      metadata={metadataComponent}
      type="list"
      bordered={true}
      image="src/images/card-image.png"
      buttonMenuItems={buttonMenuItems}
    />
  );
}

const planMetadataComponent = (
  <div css={Css.gray700.sm.$}>
    <div>4,000 - 5,000sf</div>
    <div>5-6bd / 5.5ba</div>
    <div>3 Elevations / 18 Options</div>
    <div css={Css.tiny.pt1.$}>Last Update 08/14/24</div>
  </div>
);

const metadataComponent = (
  <div css={Css.gray700.tiny.$}>
    <div>Model: VR12</div>
    <div>Code: PL-AIRSW-INSN-7900</div>
  </div>
);

const buttonMenuItems = [
  { label: "Edit", onClick: () => console.log("Edit") },
  { label: "Delete", onClick: () => console.log("Delete") },
  { label: "View", onClick: () => console.log("View") },
];
