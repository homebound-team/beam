import { BaseCard } from "src/components/BaseCard";
import { click, render, withRouter } from "src/utils/rtl";

describe("BaseCard", () => {
  it("uses imgAlt as the hero's alt text", async () => {
    // Given a card with real imgAlt
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="123 Main St" children="body" />);
    // Then it's used as-is, and the image isn't hidden from assistive tech
    expect(r.baseCard_image).toHaveAttribute("alt", "123 Main St");
    expect(r.baseCard_image).not.toHaveAttribute("aria-hidden");
  });

  it("hides a purely decorative hero from assistive tech", async () => {
    // Given a card whose image conveys nothing the body doesn't already say
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="" children="body" />);
    // Then it's hidden, rather than just carrying an empty alt
    expect(r.baseCard_image).toHaveAttribute("alt", "");
    expect(r.baseCard_image).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a plain div when onClick is unset", async () => {
    // Given a static card
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="123 Main St" children="body" />);
    // Then nothing in it is interactive
    expect(r.query.baseCard_action).toBeNull();
    expect(r.baseCard.querySelector("a")).toBeNull();
    expect(r.baseCard.querySelector("button")).toBeNull();
  });

  it("renders a link when onClick is a url", async () => {
    // Given a card that navigates
    // When rendered
    const r = await render(
      <BaseCard imgSrc="home.jpg" imgAlt="123 Main St" onClick="/homes/1" children="body" />,
      withRouter(),
    );
    // Then its body is an anchor
    expect(r.baseCard_action.tagName).toBe("A");
    expect(r.baseCard_action).toHaveAttribute("href", "/homes/1");
  });

  it("renders a button that fires onClick when it's a function", async () => {
    // Given a card that acts in place
    const onClick = vi.fn();
    // When rendered and clicked
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="123 Main St" onClick={onClick} children="body" />);
    // Then it's a button typed so it won't submit a surrounding form
    expect(r.baseCard_action.tagName).toBe("BUTTON");
    expect(r.baseCard_action).toHaveAttribute("type", "button");
    // And clicking it actually calls the handler
    click(r.baseCard_action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps action and footer outside the card's link", async () => {
    // Given a linked card with its own hero button and an interactive footer
    // When rendered
    const r = await render(
      <BaseCard
        imgSrc="home.jpg"
        imgAlt="123 Main St"
        onClick="/homes/1"
        action={{ icon: "trash", onClick: () => {}, label: "Remove" }}
        footer={<button>Footer button</button>}
      >
        body
      </BaseCard>,
      withRouter(),
    );
    // Then neither nests inside the anchor — a button inside an anchor is invalid and unclickable
    expect(r.baseCard_action.contains(r.baseCard_heroAction)).toBe(false);
    expect(r.baseCard_action.contains(r.baseCard_footer)).toBe(false);
  });

  it("rides the tag along with the link", async () => {
    // Given a linked card with a status tag
    // When rendered
    const r = await render(
      <BaseCard
        imgSrc="home.jpg"
        imgAlt="123 Main St"
        onClick="/homes/1"
        tag={{ text: "Active", type: "success" }}
        children="body"
      />,
      withRouter(),
    );
    // Then the tag sits inside the hero, which sits inside the link
    expect(r.baseCard_tag).toHaveTextContent("Active");
    expect(r.baseCard_hero.contains(r.baseCard_tag)).toBe(true);
    expect(r.baseCard_action.contains(r.baseCard_tag)).toBe(true);
  });

  it("renders action as a single button when given IconButton props", async () => {
    // Given a card whose hero action is one button
    // When rendered
    const r = await render(
      <BaseCard
        imgSrc="home.jpg"
        imgAlt="123 Main St"
        action={{ icon: "trash", onClick: () => {}, label: "Remove" }}
        children="body"
      />,
    );
    // Then it acts directly rather than opening a menu
    expect(r.baseCard_heroAction.querySelectorAll("button")).toHaveLength(1);
    expect(r.baseCard_heroAction.querySelector("button")).not.toHaveAttribute("aria-haspopup");
  });

  it("renders action as a menu trigger when given ButtonMenu props", async () => {
    // Given a card whose hero action is a menu
    // When rendered
    const r = await render(
      <BaseCard
        imgSrc="home.jpg"
        imgAlt="123 Main St"
        action={{ trigger: { icon: "verticalDots" }, items: [{ label: "Edit", onClick: () => {} }] }}
        children="body"
      />,
      withRouter(),
    );
    // Then the trigger opens a menu rather than acting directly
    expect(r.baseCard_heroAction.querySelector("button")).toHaveAttribute("aria-haspopup");
  });

  it("fixes its height when given one", async () => {
    // Given a card with an explicit height
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="123 Main St" height={430} children="body" />);
    // Then it takes that height
    expect(r.baseCard).toHaveStyle({ height: "430px" });
  });

  it("sizes to its content when given no height", async () => {
    // Given a card with no height
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="123 Main St" children="body" />);
    // Then it doesn't pin one, so the body decides
    expect(r.baseCard.style.height).toBe("");
  });
});
