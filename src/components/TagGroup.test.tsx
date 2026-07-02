import { TagGroup } from "src/components/TagGroup";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("TagGroup", () => {
  it("renders all tag texts", async () => {
    // Given a tag group with multiple tags
    const r = await render(
      <TagGroup tags={[{ text: "Plan 6 - The Elm" }, { text: "Plan 7 - The Willow" }]} data-testid="tagGroup" />,
    );

    // Then each tag label is visible
    expect(r.tagGroup).toHaveTextContent("Plan 6 - The Elm");
    expect(r.tagGroup).toHaveTextContent("Plan 7 - The Willow");
  });

  it("does not render Edit when onEdit is omitted", async () => {
    // Given a tag group without onEdit
    const r = await render(<TagGroup tags={[{ text: "Secondary Label" }]} />);

    // Then no Edit control is rendered
    expect(r.query.tagGroup_edit).toBeNull();
  });

  it("calls onEdit when Edit is clicked", async () => {
    // Given a tag group with an onEdit handler
    const onEdit = vi.fn();
    const r = await render(<TagGroup tags={[{ text: "Secondary Label" }]} onEdit={onEdit} />);

    // When the Edit control is clicked
    click(r.tagGroup_edit);

    // Then the handler is called
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("renders Edit as a link when onEdit is a string", async () => {
    // Given a tag group with a link onEdit
    const r = await render(<TagGroup tags={[{ text: "Secondary Label" }]} onEdit="/edit-path" />, {});

    // Then Edit is rendered as a link with the expected href
    expect(r.tagGroup_edit).toHaveAttribute("href", "/edit-path");
  });
});
