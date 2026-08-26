import { AiLinkCardGroup } from "src";
import { click, render, withRouter } from "src/utils/rtl";

describe("AiLinkCardGroup", () => {
  it("renders a card per finding", async () => {
    const r = await render(<AiLinkCardGroup cards={getCards()} />, withRouter());
    expect(r.linkCard_title_0).toHaveTextContent("Review 1 changed elevation.");
    expect(r.linkCard_message_0).toHaveTextContent("Describe change");
    expect(r.linkCard_title_1).toHaveTextContent("Review 1 changed program value.");
    expect(r.getAllByTestId("linkCard")).toHaveLength(2);
  });

  it("links each card to its own destination", async () => {
    const r = await render(<AiLinkCardGroup cards={getCards()} />, withRouter());
    expect(r.linkCard_action_0).toHaveAttribute("href", "/plans/1/elevations");
    expect(r.linkCard_action_1).toHaveAttribute("href", "/plans/1/program");
  });

  it("fires a card's callback", async () => {
    const onClick = vi.fn();
    const r = await render(<AiLinkCardGroup cards={[{ title: "Review 1 changed elevation.", action: { onClick } }]} />);
    click(r.linkCard_action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when it has no cards", async () => {
    const r = await render(<AiLinkCardGroup cards={[]} />);
    // No bare AI panel + logo for callers to have to guard against.
    expect(r.query.aiLinkCardGroup).not.toBeInTheDocument();
  });
});

function getCards() {
  return [
    {
      title: "Review 1 changed elevation.",
      message: "Describe change",
      action: { onClick: "/plans/1/elevations" },
    },
    { title: "Review 1 changed program value.", action: { onClick: "/plans/1/program" } },
  ];
}
