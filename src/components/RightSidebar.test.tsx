import { click, render } from "src/utils/rtl";
import { RightSidebar, SidebarContentProps } from "./RightSidebar";

describe("RightSidebar", () => {
  it("can render and hide content", async () => {
    const content = [
      { icon: "comment", render: () => <div>Comments</div> },
      { icon: "time", render: () => <div>History</div> },
    ] as SidebarContentProps[];

    // Given a right sidebar component with content
    const r = await render(<RightSidebar content={content} />);

    // Expect the sidebar to render the icons and not render content initially
    expect(r.comment).toBeInTheDocument();
    expect(r.time).toBeInTheDocument();
    expect(r.query.rightSidebar_content).not.toBeInTheDocument();

    // Expect the sidebar to render the content when an icon is clicked
    click(r.comment);
    expect(r.rightSidebar_content).toHaveTextContent("Comments");
    expect(r.rightSidebar_content).not.toHaveTextContent("History");

    // Expect the sidebar to render different content when another icon is clicked
    click(r.time);
    expect(r.rightSidebar_content).toHaveTextContent("History");
    expect(r.rightSidebar_content).not.toHaveTextContent("Comments");

    // Expect the sidebar to hide content when the close button is clicked
    click(r.x);
    expect(r.query.rightSidebar_content).not.toBeInTheDocument();
  });
});
