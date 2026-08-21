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

  it("prepends AutoSaveIndicator in the actions area when withAutoSave is true", async () => {
    // Given a ContentHeader with withAutoSave and actions
    const r = await render(
      <ContentHeader title="Trade Partners" withAutoSave actions={[{ label: "Add", onClick: () => {} }]} />,
    );
    // Then AutoSaveIndicator renders before the actions
    expect(r.autoSave).toBeInTheDocument();
    expect(r.autoSave.compareDocumentPosition(r.add)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("renders AutoSaveIndicator in the actions area when withAutoSave is true and actions are omitted", async () => {
    // Given a ContentHeader with withAutoSave and no actions
    const r = await render(<ContentHeader title="Trade Partners" withAutoSave />);
    // Then the actions slot still renders with AutoSaveIndicator
    expect(r.contentHeader_actions).toBeInTheDocument();
    expect(r.autoSave).toBeInTheDocument();
  });

  it("renders an h2 at the xl size by default", async () => {
    // Given a ContentHeader with a title
    const r = await render(<ContentHeader title="Trade Partners" />);
    // Then the title is an h2 at the xl size
    expect(r.contentHeader_title.tagName).toBe("H2");
    expect(r.contentHeader_title).toHaveStyle({ fontSize: "20px" });
  });

  it("renders an h3 at the lg size when level is 3", async () => {
    // Given a ContentHeader at level 3
    const r = await render(<ContentHeader title="Trade Partners" level={3} />);
    // Then the title is an h3 at the lg size
    expect(r.contentHeader_title.tagName).toBe("H3");
    expect(r.contentHeader_title).toHaveStyle({ fontSize: "18px" });
  });

  it("renders an h4 at the mdSb size when level is 4", async () => {
    // Given a ContentHeader at level 4
    const r = await render(<ContentHeader title="Electrical" level={4} />);
    // Then the title is an h4 at the mdSb size
    expect(r.contentHeader_title.tagName).toBe("H4");
    expect(r.contentHeader_title).toHaveStyle({ fontSize: "16px" });
  });

  it("renders startAdornment before the title", async () => {
    // Given a ContentHeader with a start adornment
    const r = await render(<ContentHeader title="Electrical" startAdornment={<span>Drag</span>} />);
    // Then the adornment renders before the title
    expect(r.getByText("Drag").compareDocumentPosition(r.contentHeader_title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
