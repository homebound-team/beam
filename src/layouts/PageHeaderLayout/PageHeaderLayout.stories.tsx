import { Meta } from "@storybook/react-vite";
import { AiPanel } from "src/components/AiPanel";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { pageContentPaddingX } from "src/layouts/layoutSpacing";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { withBeamDecorator, withRouter, zeroTo } from "src/utils/sb";

export default {
  component: PageHeaderLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: { layout: "fullscreen" },
} as Meta;

/** The header auto-hides on scroll-down and reveals on scroll-up (tall body to demonstrate). */
export function Default() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Page title", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <Body />
    </PageHeaderLayout>
  );
}

/**
 * An `AiPanel` above content the user keeps working in. Outside `pageContentPaddingX` on purpose, so
 * its wash spans the body rather than starting in the gutters.
 */
export function WithAiPanel() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Page title", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <AiPanel
        title="Importing Details..."
        message="This process can take a few minutes. Feel free to keep working in another tab."
      />
      <Body />
    </PageHeaderLayout>
  );
}

function Body() {
  return (
    <div css={{ ...pageContentPaddingX, ...Css.py2.$ }}>
      {zeroTo(30).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </div>
  );
}
