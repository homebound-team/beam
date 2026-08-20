import { ContentHeader } from "src/components/Headers/ContentHeader";
import { CenteredLayout } from "src/layouts/CenteredLayout/CenteredLayout";
import {
  beamLayoutContentPaddingXVar,
  documentScrollContentLeft,
  documentScrollContentWidth,
  pageContentPaddingXValue,
} from "src/layouts/layoutVars";
import { render } from "src/utils/rtl";

describe("ContentHeader", () => {
  it("renders title, description, and actions when provided", async () => {
    // Given a ContentHeader with a title, description, and actions
    const r = await render(
      <ContentHeader
        title="Trade Partners"
        description="Assign and manage trade partners for this project."
        actions={[{ label: "Add", onClick: () => {} }]}
      />,
    );
    // Then all three render and the header uses layoutContainer sticky chrome
    expect(r.contentHeader_title).toHaveTextContent("Trade Partners");
    expect(r.contentHeader_description).toHaveTextContent("Assign and manage trade partners for this project.");
    expect(r.add).toBeInTheDocument();
    expect(r.contentHeader).toHaveStyle({
      position: "sticky",
      minWidth: "0px",
    });
  });

  it("uses layoutContainer formulas that read padding from CenteredLayout", async () => {
    // Given a ContentHeader inside a padded shell
    const r = await render(
      <CenteredLayout size="lg">
        <ContentHeader title="Trade Partners" />
      </CenteredLayout>,
    );

    // Then the shell publishes padding and layoutContainer width/left reference the inherited var
    expect(r.centeredLayout.style.getPropertyValue(beamLayoutContentPaddingXVar)).toBe(pageContentPaddingXValue);
    expect(r.contentHeader).toHaveStyle({
      width: `min(100%, ${documentScrollContentWidth()})`,
      left: documentScrollContentLeft(),
    });
  });

  it("renders nothing when no title, description, or actions are provided", async () => {
    // Given a ContentHeader with no props set
    const r = await render(<ContentHeader />);
    // Then it renders nothing at all, not even an empty wrapper
    expect(r.query.contentHeader).not.toBeInTheDocument();
  });
});
