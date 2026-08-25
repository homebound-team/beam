import { LinkCard } from "src";
import { click, render, withRouter } from "src/utils/rtl";

describe("LinkCard", () => {
  it("renders its title and message", async () => {
    const r = await render(
      <LinkCard title="Review 1 changed elevation." message="Describe change" action={{ onClick: () => {} }} />,
    );
    expect(r.linkCard_title).toHaveTextContent("Review 1 changed elevation.");
    expect(r.linkCard_message).toHaveTextContent("Describe change");
  });

  it("omits the message when it has none", async () => {
    const r = await render(<LinkCard title="Review 1 changed elevation." action={{ onClick: () => {} }} />);
    expect(r.query.linkCard_message).not.toBeInTheDocument();
  });

  it("fires its action", async () => {
    const onClick = vi.fn();
    const r = await render(<LinkCard title="Review 1 changed elevation." action={{ onClick }} />);
    click(r.linkCard_action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("links when given a url", async () => {
    const r = await render(
      <LinkCard title="Review 1 changed elevation." action={{ onClick: "/plans/1/elevations" }} />,
      withRouter(),
    );
    expect(r.linkCard_action).toHaveAttribute("href", "/plans/1/elevations");
  });

  it("opens in a new tab when asked", async () => {
    const r = await render(
      <LinkCard title="Review 1 changed elevation." action={{ onClick: "/plans/1/elevations", openInNew: true }} />,
      withRouter(),
    );
    expect(r.linkCard_action).toHaveAttribute("target", "_blank");
  });

  it("names the arrow after the title", async () => {
    const r = await render(<LinkCard title="Review 1 changed elevation." action={{ onClick: () => {} }} />);
    // No "link"/"action" suffix — the anchor role is already announced.
    expect(r.linkCard_action).toHaveAttribute("aria-label", "Review 1 changed elevation.");
  });

  it("centers the arrow against a title-only card", async () => {
    const r = await render(<LinkCard title="Review 1 changed elevation." action={{ onClick: () => {} }} />);
    expect(r.linkCard).toHaveStyle({ alignItems: "center" });
  });

  it("tops the arrow once there's a message to wrap under it", async () => {
    const r = await render(
      <LinkCard title="Review 1 changed elevation." message="Describe change" action={{ onClick: () => {} }} />,
    );
    expect(r.linkCard).toHaveStyle({ alignItems: "start" });
  });

  it("leaves links in the message clickable", async () => {
    const r = await render(
      <LinkCard
        title="Review 1 changed elevation."
        message={<a href="/documents/1">Document Name Here</a>}
        action={{ onClick: () => {} }}
      />,
    );
    // The card itself isn't a link, so the message's own link is still its own tab stop.
    expect(r.linkCard_message.querySelector("a")).toHaveAttribute("href", "/documents/1");
  });
});
