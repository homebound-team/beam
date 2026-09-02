import { BaseCard } from "src/components/BaseCard";
import { maybeCssVar, Tokens } from "src/Css";
import { render, withRouter } from "src/utils/rtl";

describe("BaseCard", () => {
  it("treats the hero as decorative by default", async () => {
    // Given a card with no imgAlt
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg">body</BaseCard>);
    // Then the hero is decorative, since the body names the card
    expect(r.baseCard_image).toHaveAttribute("src", "home.jpg");
    expect(r.baseCard_image).toHaveAttribute("alt", "");
  });

  it("uses imgAlt when the hero carries meaning", async () => {
    // Given a card with an explicit alt
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" imgAlt="123 Main St" children="body" />);
    // Then it wins over the decorative default
    expect(r.baseCard_image).toHaveAttribute("alt", "123 Main St");
  });

  it("fills the frame by default and shows the full image when contain is requested", async () => {
    // Given a card with no imageFit
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg">body</BaseCard>);
    // Then the hero fills the frame
    expect(r.baseCard_image).toHaveStyle({ objectFit: "cover" });
    // When contain is requested
    r.rerender(
      <BaseCard imgSrc="home.jpg" imageFit="contain">
        body
      </BaseCard>,
    );
    // Then the full image is shown
    expect(r.baseCard_image).toHaveStyle({ objectFit: "contain" });
  });

  it("renders a plain div when neither to nor onClick is set", async () => {
    // Given a static card
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg">body</BaseCard>);
    // Then nothing in it is interactive
    expect(r.query.baseCard_action).toBeNull();
    expect(r.baseCard.querySelector("a")).toBeNull();
    expect(r.baseCard.querySelector("button")).toBeNull();
    // And it doesn't invite a click it can't act on
    expect(r.baseCard).not.toHaveStyle({ cursor: "pointer" });
  });

  it("only invites a click when the card is actually interactive", async () => {
    // Given a card that navigates
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" to="/homes/1" children="body" />, withRouter());
    // Then it shows a pointer cursor
    expect(r.baseCard).toHaveStyle({ cursor: "pointer" });
  });

  it("renders a link for to", async () => {
    // Given a card that navigates
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" to="/homes/1" children="body" />, withRouter());
    // Then its body is an anchor
    expect(r.baseCard_action.tagName).toBe("A");
    expect(r.baseCard_action).toHaveAttribute("href", "/homes/1");
  });

  it("renders a non-submitting button for onClick", async () => {
    // Given a card that acts on click
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" onClick={() => {}} children="body" />);
    // Then it is a button typed so it won't submit a surrounding form
    expect(r.baseCard_action.tagName).toBe("BUTTON");
    expect(r.baseCard_action).toHaveAttribute("type", "button");
  });

  it("labels the action from imgAlt, without a separate label prop", async () => {
    // Given an interactive card with a meaningful imgAlt
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" onClick={() => {}} imgAlt="123 Main St" children="body" />);
    // Then that text becomes the action's accessible name
    expect(r.baseCard_action).toHaveAttribute("aria-label", "123 Main St");
  });

  it("leaves the action unlabeled when the hero is decorative", async () => {
    // Given an interactive card with no imgAlt, i.e. a self-describing body
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" onClick={() => {}} children="123 Main St" />);
    // Then no aria-label is set — the browser derives the accessible name from the button's own text
    expect(r.baseCard_action).not.toHaveAttribute("aria-label");
  });

  it("keeps action and footer outside the card's link", async () => {
    // Given a linked card with its own hero button and an interactive footer
    // When rendered
    const r = await render(
      <BaseCard
        imgSrc="home.jpg"
        to="/homes/1"
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

  it("renders the tag inside the hero so it rides along with the link", async () => {
    // Given a linked card with a status tag
    // When rendered
    const r = await render(
      <BaseCard imgSrc="home.jpg" to="/homes/1" tag={{ text: "Active", type: "success" }} children="body" />,
      withRouter(),
    );
    // Then the tag sits in the hero, inside the anchor — a Tag isn't focusable, so that nesting is legal
    expect(r.baseCard_tag).toHaveTextContent("Active");
    expect(r.baseCard_hero.contains(r.baseCard_tag)).toBe(true);
    expect(r.baseCard_action.contains(r.baseCard_tag)).toBe(true);
  });

  it("renders action as a single button when given IconButton props", async () => {
    // Given a card whose hero action is one button
    // When rendered
    const r = await render(
      <BaseCard imgSrc="home.jpg" action={{ icon: "trash", onClick: () => {}, label: "Remove" }} children="body" />,
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
        action={{ trigger: { icon: "verticalDots" }, items: [{ label: "Edit", onClick: () => {} }] }}
        children="body"
      />,
      withRouter(),
    );
    // Then the trigger opens a menu rather than acting directly
    expect(r.baseCard_heroAction.querySelector("button")).toHaveAttribute("aria-haspopup");
  });

  it("paints the AI background and border when aiMode is true", async () => {
    // Given a card in aiMode
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" aiMode children="body" />);
    // Then it takes the AI fill and the heavier AI border. Tokenized *border colors* can't be asserted
    // via toHaveStyle — jsdom resolves an unresolved var() to black — so the width stands in.
    expect(r.baseCard).toHaveStyle({ backgroundColor: maybeCssVar(Tokens.AiFieldBg) });
    expect(r.baseCard).toHaveStyle({ borderWidth: "2px" });
  });

  it("fixes its height when given one", async () => {
    // Given a card with an explicit height
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" height={430} children="body" />);
    // Then it takes that height
    expect(r.baseCard).toHaveStyle({ height: "430px" });
  });

  it("sizes to its content when given no height", async () => {
    // Given a card with no height
    // When rendered
    const r = await render(<BaseCard imgSrc="home.jpg" children="body" />);
    // Then it doesn't pin one, so the body decides
    expect(r.baseCard.style.height).toBe("");
  });
});
