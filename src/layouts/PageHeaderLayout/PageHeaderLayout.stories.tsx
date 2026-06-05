import { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
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

function Body() {
  return (
    <div css={Css.px3.py2.$}>
      {zeroTo(30).map((i) => (
        <p key={i} css={Css.mb3.$}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section {i + 1}.
        </p>
      ))}
    </div>
  );
}
