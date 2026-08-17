import { AiReviewBanner } from "src";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("AiReviewBanner", () => {
  it("renders its copy", async () => {
    const r = await render(<AiReviewBanner title="Review updates found in your import." message="Two changes." />);
    expect(r.aiReviewBanner_title).toHaveTextContent("Review updates found in your import.");
    expect(r.aiReviewBanner_message).toHaveTextContent("Two changes.");
  });

  it("omits the message when not given", async () => {
    const r = await render(<AiReviewBanner title="Review updates" />);
    expect(r.query.aiReviewBanner_message).not.toBeInTheDocument();
  });

  it("omits the actions row when neither action is given", async () => {
    const r = await render(<AiReviewBanner title="Review updates" />);
    expect(r.query.aiReviewBanner_actions).not.toBeInTheDocument();
  });

  it("renders both actions, secondary first", async () => {
    const r = await render(
      <AiReviewBanner
        title="Review updates"
        secondaryAction={{ label: "Clear Import", onClick: () => {} }}
        primaryAction={{ label: "Accept Import", onClick: () => {} }}
      />,
    );
    const labels = Array.from(r.aiReviewBanner_actions.querySelectorAll("button")).map((b) => b.textContent);
    expect(labels).toEqual(["Clear Import", "Accept Import"]);
  });

  it("fires the actions", async () => {
    const onAccept = vi.fn();
    const r = await render(
      <AiReviewBanner title="Review updates" primaryAction={{ label: "Accept", onClick: onAccept }} />,
    );
    click(r.accept);
    expect(onAccept).toHaveBeenCalled();
  });

  it("puts the actions beside the copy, not below it", async () => {
    const r = await render(
      <AiReviewBanner
        title="Review updates"
        message="m"
        secondaryAction={{ label: "Clear Import", onClick: () => {} }}
      />,
    );
    // Then the copy and the actions are siblings in one row, actions last
    const row = r.aiReviewBanner_actions.parentElement!;
    expect(row.children).toHaveLength(2);
    expect(row.lastElementChild).toBe(r.aiReviewBanner_actions);
  });

  it("compacts the title relative to the stacked banner", async () => {
    const r = await render(<AiReviewBanner title="t" />);
    // Then it is 16/24, versus the 18/28 AiImportBanner uses when its copy is stacked
    expect(r.aiReviewBanner_title).toHaveStyle({ fontSize: "16px", lineHeight: "24px" });
  });

  it("is not a live region", async () => {
    // Given the AI has finished — there's nothing in flight to announce
    const r = await render(<AiReviewBanner title="Review updates" />);
    expect(r.aiReviewBanner).not.toHaveAttribute("role");
  });
});
