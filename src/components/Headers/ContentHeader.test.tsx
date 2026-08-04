import { ContentHeader } from "src/components/Headers/ContentHeader";
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
    // Then all three render
    expect(r.contentHeader_title).toHaveTextContent("Trade Partners");
    expect(r.contentHeader_description).toHaveTextContent("Assign and manage trade partners for this project.");
    expect(r.add).toBeInTheDocument();
  });

  it("renders nothing when no title, description, or actions are provided", async () => {
    // Given a ContentHeader with no props set
    const r = await render(<ContentHeader />);
    // Then it renders nothing at all, not even an empty wrapper
    expect(r.query.contentHeader).not.toBeInTheDocument();
  });
});
