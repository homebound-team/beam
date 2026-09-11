import { InlineFeedbackBanner } from "src";
import { noop } from "src/utils/helpers";
import { click, render, withRouter } from "src/utils/rtl";

describe("InlineFeedbackBanner", () => {
  it("renders its description", async () => {
    const r = await render(<InlineFeedbackBanner type="error" description="Add Stained Wood Ceiling was not found." />);
    expect(r.inlineFeedbackBanner_description).toHaveTextContent("Add Stained Wood Ceiling was not found.");
  });

  it("uses the error icon when type is error", async () => {
    const r = await render(<InlineFeedbackBanner type="error" description="Not found." />);
    expect(r.inlineFeedbackBanner_tag.querySelector("svg")).toHaveAttribute("data-icon", "xCircle");
  });

  it("uses the warning icon when type is warning", async () => {
    const r = await render(<InlineFeedbackBanner type="warning" description="Used as a requirement." />);
    expect(r.inlineFeedbackBanner_tag.querySelector("svg")).toHaveAttribute("data-icon", "error");
  });

  it("shows the tag text when given one", async () => {
    const r = await render(
      <InlineFeedbackBanner type="error" tagText="Missing costs" description="Two bid lines are missing costs." />,
    );
    expect(r.inlineFeedbackBanner_tag).toHaveTextContent("Missing costs");
  });

  it("falls back to the type as the tag's accessible label", async () => {
    const r = await render(<InlineFeedbackBanner type="warning" description="Used as a requirement." />);
    expect(r.inlineFeedbackBanner_tag).toHaveTextContent("Warning");
  });

  it("fires each action", async () => {
    const onKeep = vi.fn();
    const onRemove = vi.fn();
    const r = await render(
      <InlineFeedbackBanner
        type="warning"
        description="Used as a requirement."
        actions={[
          { label: "Keep", onClick: onKeep },
          { label: "Remove", onClick: onRemove },
        ]}
      />,
    );
    click(r.keep);
    click(r.remove);
    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("fires a menu action's item", async () => {
    // Given a banner whose action is a menu
    const onKeep = vi.fn();
    const r = await render(
      <InlineFeedbackBanner
        type="warning"
        tagText="In use"
        description="Used as a requirement for Extend Backsplash Kitchen 109."
        actions={[
          {
            kind: "menu",
            label: "Resolve",
            items: [
              { label: "Keep", onClick: onKeep },
              { label: "Remove", onClick: noop },
            ],
          },
        ]}
      />,
      // `MenuItem` navigates for string `onClick`s, so it always wants a router
      withRouter(),
    );
    // When we open it and pick an item
    click(r.resolve);
    click(r.resolve_keep);
    // Then that item fired
    expect(onKeep).toHaveBeenCalledTimes(1);
  });

  it("omits the actions when it has none", async () => {
    const r = await render(<InlineFeedbackBanner type="error" description="Not found." />);
    expect(r.query.reviewMatches).not.toBeInTheDocument();
  });
});
