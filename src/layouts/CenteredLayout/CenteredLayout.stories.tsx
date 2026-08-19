import { Meta } from "@storybook/react-vite";
import { Button } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import { PageHeaderLayout } from "src/layouts/PageHeaderLayout";
import { viewportModes, withBeamDecorator, withRouter } from "src/utils/sb";

export default {
  component: CenteredLayout,
  decorators: [withBeamDecorator, withRouter()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
  },
} as Meta;

export function Large() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Dashboard", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <CenteredLayout size="lg">
        <PlaceholderBody />
      </CenteredLayout>
    </PageHeaderLayout>
  );
}

export function Small() {
  return (
    <PageHeaderLayout pageHeader={{ title: "Form", rightSlot: <Button label="Action" onClick={() => {}} /> }}>
      <CenteredLayout size="sm">
        <PlaceholderBody />
      </CenteredLayout>
    </PageHeaderLayout>
  );
}

function PlaceholderBody() {
  return (
    <div css={Css.df.fdc.gap2.py3.$}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} css={Css.hPx(48).br4.bgColor(Tokens.SurfaceSeparator).$} />
      ))}
    </div>
  );
}
