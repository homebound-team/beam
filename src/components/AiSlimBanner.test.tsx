import { AiSlimBanner } from "src";
import { click, render } from "src/utils/rtl";

describe("AiSlimBanner", () => {
  it("renders its title beside the sparkle", async () => {
    const r = await render(<AiSlimBanner title="Review 4 Suggested Changes" />);
    expect(r.aiSlimBanner_title).toHaveTextContent("Review 4 Suggested Changes");
    expect(r.aiSlimBanner_sparkle).toHaveAttribute("data-icon", "aiStar");
  });

  it("fires its action", async () => {
    const onIgnore = vi.fn();
    const r = await render(
      <AiSlimBanner title="Review 4 Suggested Changes" action={{ label: "Ignore All", onClick: onIgnore }} />,
    );
    click(r.ignoreAll);
    expect(onIgnore).toHaveBeenCalledTimes(1);
  });

  it("omits the action when it has none", async () => {
    const r = await render(<AiSlimBanner title="Review 4 Suggested Changes" />);
    expect(r.query.aiSlimBanner_action).not.toBeInTheDocument();
  });
});
