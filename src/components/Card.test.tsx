import { fireEvent } from "@testing-library/react";
import { Palette } from "src/Css";
import { noop } from "src/utils/helpers";
import { click, render, withRouter } from "src/utils/rtl";
import { Card, type CardProps } from "./Card";

describe("Card Component", () => {
  const defaultProps: CardProps = {
    title: "Test Card",
    subtitle: "Test Subtitle",
    imgSrc: "plan-exterior.png",
    detailContent: <div>Detail Content</div>,
    tag: { text: "Active", type: "success" },
  };

  it("can render", async () => {
    // Given a card component
    const r = await render(<Card {...defaultProps} />);

    // Expect the card to render each section
    expect(r.card_title).toHaveTextContent("Test Card");
    expect(r.card_subtitle).toHaveTextContent("Test Subtitle");
    expect(r.card_img).toHaveAttribute("src", "plan-exterior.png");
    expect(r.card_tag).toHaveTextContent("Active");
    expect(r.card_details).toHaveTextContent("Detail Content");
  });

  it("passes the tag's variant through", async () => {
    // Given a card with a bold tag
    const r = await render(<Card {...defaultProps} tag={{ text: "Active", type: "success", variant: "bold" }} />);
    // Then the tag takes the bold success fill
    expect(r.card_tag).toHaveStyle({ backgroundColor: Palette.Green600 });
  });

  it("uses a fixed width by default", async () => {
    // Given a list card
    const r = await render(<Card {...defaultProps} type="list" />);
    // Expect the default list width
    expect(r.card).toHaveStyle({ width: "520px" });
  });

  it("can follow its container when fullWidth", async () => {
    // Given a fullWidth list card
    const r = await render(<Card {...defaultProps} type="list" fullWidth />);
    // Expect the fixed width to be dropped
    expect(r.card).toHaveStyle({ width: "100%" });
  });

  it("can display and handle click events on the vertical dots menu button", async () => {
    // Given a card component with buttonMenuItems
    const buttonMenuItems = [{ label: "View", onClick: noop }];
    const r = await render(<Card {...defaultProps} buttonMenuItems={buttonMenuItems} />, withRouter());

    // Expect the vertical dots menu button to be in the document initially
    expect(r.query.verticalDots).not.toBeInTheDocument();

    // When the card is hovered
    fireEvent.pointerEnter(r.card);

    // Expect the vertical dots menu button to be in the document
    expect(r.verticalDots).toBeInTheDocument();
    expect(r.query.verticalDots_view).not.toBeInTheDocument();

    // When the vertical dots menu button is clicked
    click(r.verticalDots);

    // Expect the menu to be in the document
    expect(r.verticalDots_view).toBeInTheDocument();
  });
});
