import { Meta } from "@storybook/react";
import { RightPaneLayout } from "src/components/Layout/RightPaneLayout/RightPaneLayout";
import { Css } from "src/Css";
import { Button } from "../../Button";
import { useRightPane } from "./useRightPane";

export default {
  component: RightPaneLayout,
  title: "Workspace/Components/Layout/RightPaneLayout",
} as Meta;

function SampleContent() {
  const { openRightPane } = useRightPane();
  return (
    <div>
      <Button label={"Open Pane"} onClick={() => openRightPane({ content: <DetailPane /> })} />
    </div>
  );
}

function DetailPane() {
  const { closeRightPane } = useRightPane();
  return (
    <div>
      <Button label={"Close Pane"} onClick={() => closeRightPane()} />
    </div>
  );
}

export function Examples() {
  return (
    <div css={Css.df.fdc.gap2.$}>
      <RightPaneLayout>
        <SampleContent />
      </RightPaneLayout>
    </div>
  );
}
