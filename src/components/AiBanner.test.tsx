import { AiBanner } from "src";
import { click, render } from "src/utils/rtl";

describe("AiBanner", () => {
  it("renders its title and message", async () => {
    const r = await render(
      <AiBanner
        title="Review changes to your plan found in your latest document capture."
        message="Review the changes highlighted below including 4 warnings."
      />,
    );
    expect(r.aiBanner_title).toHaveTextContent("Review changes to your plan");
    expect(r.aiBanner_message).toHaveTextContent("including 4 warnings");
  });

  it("omits the message when it has none", async () => {
    const r = await render(<AiBanner title="Review changes" />);
    expect(r.query.aiBanner_message).not.toBeInTheDocument();
  });

  it("fires each action", async () => {
    const onAccept = vi.fn();
    const onIgnore = vi.fn();
    const r = await render(
      <AiBanner
        title="Review changes"
        primaryAction={{ label: "Accept All", onClick: onAccept }}
        secondaryAction={{ label: "Ignore All", onClick: onIgnore }}
      />,
    );
    click(r.acceptAll);
    click(r.ignoreAll);
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onIgnore).toHaveBeenCalledTimes(1);
  });

  it("omits the actions row when it has no actions", async () => {
    const r = await render(<AiBanner title="Review changes" />);
    expect(r.query.aiBanner_actions).not.toBeInTheDocument();
  });

  it("can render just one action", async () => {
    const r = await render(
      <AiBanner title="Review changes" primaryAction={{ label: "Accept All", onClick: () => {} }} />,
    );
    expect(r.aiBanner_actions).toBeInTheDocument();
    expect(r.query.ignoreAll).not.toBeInTheDocument();
  });
});
