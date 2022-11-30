import { Meta } from "@storybook/react";
import { TreeSelect } from "./TreeSelect";

export default {
  component: TreeSelect,
  title: "Workspace/Inputs/TreeSelect",
} as Meta;

const data = [
  {
    label: "Austin Dev 1",
    value: "Austin Dev 1",
    tagClassName: "special",
    children: [
      {
        label: "Cohort 1",
        value: "Cohort 1",
        children: [
          {
            label: "123 Austin Street",
            value: "123 Austin Street",
          },
          {
            label: "456 Austin Ave",
            value: "456 Austin Ave",
          },
          {
            label: "789 Austin Way",
            value: "789 Austin Way",
          },
        ],
      },
    ],
  },
  {
    label: "Austin Dev 2",
    value: "Austin Dev 2",
    children: [
      {
        label: "Cohort 1",
        value: "Cohort 1",
        children: [
          {
            label: "1207 Casey Street",
            value: "1207 Casey Street",
          },
          {
            label: "1300 Georgian St B",
            value: "1300 Georgian St B",
          },
          {
            label: "1803 Belford St B",
            value: "1803 Belford St B",
          },
          {
            label: "205 W Croslin St B,",
            value: "205 W Croslin St B,",
          },
        ],
      },
    ],
  },
  {
    label: "Dallas",
    value: "Dallas",
    children: [
      {
        label: "Cohort 1",
        value: "Cohort 1",
      },
    ],
  },
  {
    label: "Santa Rose Fountaingrove",
    value: "Santa Rose Fountaingrove",
    children: [
      {
        label: "Cohort 1",
        value: "Cohort 1",
      },
      {
        label: "Cohort 2",
        value: "Cohort 2",
      },
    ],
  },
];

const onChange = (currentNode, selectedNodes) => {
  console.log("path::", currentNode.path);
};

export const DropDownTreeSelectLibrary = () => {
  return <TreeSelect />;
};
