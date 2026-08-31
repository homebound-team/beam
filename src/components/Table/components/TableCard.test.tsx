import { fireEvent } from "@testing-library/react";
import { TableCardView } from "src/components/Table/components/TableCard";
import { maybeCssVar, Palette, Tokens } from "src/Css";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("TableCardView", () => {
  const imgSrc = "home.jpg";
  const thumbnails = [
    { id: "mv:1", imgUrl: "chrome.png", label: "Polished Chrome", to: "/mv/1" },
    { id: "mv:2", imgUrl: "black.png", label: "Matte Black", to: "/mv/2" },
  ];

  it("renders title and image with title as alt text", async () => {
    // Given a card with only required props
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    // Then title text is displayed and used as the image alt
    expect(r.tableCardView_title).toHaveTextContent("123 Main St");
    expect(r.tableCardView_image).toHaveAttribute("alt", "123 Main St");
  });

  it("paints AiFieldBg when aiMode is true", async () => {
    // Given a card in aiMode
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} aiMode />);
    // Then the card uses the AI field background
    expect(r.tableCardView).toHaveStyle({ backgroundColor: maybeCssVar(Tokens.AiFieldBg) });
  });

  it("draws the AI border and tints the progress track when aiMode is true", async () => {
    // Given a card in aiMode
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} progress={69} aiMode />);
    // Then it takes the heavier AI border. Tokenized *border colors* can't be asserted via toHaveStyle —
    // jsdom resolves an unresolved var() to black — so the width stands in, same as Tabs.test.tsx notes.
    expect(r.tableCardView).toHaveStyle({ borderWidth: "2px" });
    // And the track tints so it stays visible on the AI background, while the fill stays blue — a progress
    // bar isn't a proposal, so it never reads as AI
    expect(r.tableCardView_progressTrack).toHaveStyle({ backgroundColor: Palette.Purple200 });
    expect(r.tableCardView_progressFill).toHaveStyle({ backgroundColor: Palette.Blue500 });
  });

  it("renders a proposed title and eyebrow as AI proposals", async () => {
    // Given a card the AI invented outright
    // When rendered
    const r = await render(
      <TableCardView imgSrc={imgSrc} leftEyebrow="002" leftEyebrowProposed title="Spanish" titleProposed data={[]} />,
    );
    // Then both read as proposals, while the title stays plain text for the image's alt
    expect(r.tableCardView_title).toHaveTextContent("Spanish");
    expect(r.tableCardView_image).toHaveAttribute("alt", "Spanish");
    expect(r.tableCardView_titleProposal_proposed).toHaveStyle({ color: maybeCssVar(Tokens.AiFieldFg) });
    expect(r.tableCardView_leftEyebrowProposal_proposed).toHaveStyle({ color: maybeCssVar(Tokens.AiFieldFg) });
  });

  it("applies no AI styling when aiMode is unset", async () => {
    // Given a card on record
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} progress={72} />);
    // Then it keeps the default border, background, text, and progress colors
    expect(r.tableCardView).toHaveStyle({ borderWidth: "1px", backgroundColor: maybeCssVar(Tokens.SurfaceRaised) });
    expect(r.tableCardView_progressTrack).toHaveStyle({ backgroundColor: maybeCssVar(Tokens.SurfaceSubtle) });
    expect(r.tableCardView_progressFill).toHaveStyle({ backgroundColor: Palette.Blue500 });
  });

  it("renders left eyebrow above title", async () => {
    // Given a card with a left eyebrow
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" leftEyebrow="Lot 42" data={[]} />);
    // Then the left eyebrow text is displayed
    expect(r.tableCardView_leftEyebrow).toHaveTextContent("Lot 42");
  });

  it("renders left and right eyebrows on the meta row", async () => {
    // Given a card with both eyebrows
    // When rendered
    const r = await render(
      <TableCardView imgSrc={imgSrc} title="123 Main St" leftEyebrow="Kohler" rightEyebrow="Shower Faucet" data={[]} />,
    );
    // Then both sides of the meta row render
    expect(r.tableCardView_leftEyebrow).toHaveTextContent("Kohler");
    expect(r.tableCardView_rightEyebrow).toHaveTextContent("Shower Faucet");
  });

  it("renders badge inline with title", async () => {
    // Given a card with a badge prop
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" badge="Austin, TX" data={[]} />);
    // Then the badge text is displayed
    expect(r.tableCardView_badge).toHaveTextContent("Austin, TX");
  });

  it("renders status Tag", async () => {
    // Given a card with a status prop
    // When rendered
    const r = await render(
      <TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} status={{ text: "Active", type: "success" }} />,
    );
    // Then the status Tag shows the text
    expect(r.tableCardView_status).toHaveTextContent("Active");
  });

  it("renders data blocks as 'header: value' pairs", async () => {
    // Given a card with data blocks
    const data = [
      { label: "Beds", value: "3" },
      { label: "Baths", value: "2" },
    ];
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={data} />);
    // Then each block is displayed as a label: value pair
    expect(r.tableCardView_beds).toHaveTextContent("Beds:3");
    expect(r.tableCardView_baths).toHaveTextContent("Baths:2");
  });

  it("renders progress bar with percentage label", async () => {
    // Given a card with a progress value of 65
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} progress={65} />);
    // Then the progress bar shows 65%
    expect(r.tableCardView_progressValue).toHaveTextContent("65%");
  });

  it("omits optional sections when props are absent", async () => {
    // Given a card with only required props
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    // Then optional sections are not in the document
    expect(r.query.tableCardView_progressValue).not.toBeInTheDocument();
    expect(r.query.tableCardView_eyebrow).not.toBeInTheDocument();
    expect(r.query.tableCardView_interactiveFooter).not.toBeInTheDocument();
  });

  it("renders carousel title and thumbnails", async () => {
    // Given a card with a carousel
    const thumbnails = [
      { id: "mv:1", imgUrl: "chrome-swatch.png", label: "Polished Chrome", to: "/mv/1" },
      { id: "mv:2", imgUrl: "black-swatch.png", label: "Matte Black", to: "/mv/2" },
    ];
    // When rendered
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        leftEyebrow="Kohler"
        rightEyebrow="Shower Faucet"
        data={[]}
        interactiveFooter={{ kind: "carousel", title: "2 Variants", thumbnails }}
      />,
      { at: { url: "/" } },
    );
    // Then carousel title and thumbnails are present
    expect(r.tableCardView_carouselTitle).toHaveTextContent("2 Variants");
    expect(r.tableCardView_carousel_item_0).toHaveAttribute("href", "/mv/1");
    expect(r.tableCardView_carousel_item_1).toHaveAttribute("href", "/mv/2");
  });

  it("covers the hero by default and can opt into contain", async () => {
    // Given a carousel card with no imageFit override
    const thumbnails = [{ id: "mv:1", imgUrl: "chrome.png", label: "Chrome", to: "/mv/1" }];
    // When rendered
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        data={[]}
        interactiveFooter={{ kind: "carousel", title: "1 Color", thumbnails }}
      />,
      { at: { url: "/" } },
    );
    // Then the hero fills the frame
    expect(r.tableCardView_image).toHaveStyle({ objectFit: "cover" });
    // When contain is requested
    r.rerender(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        data={[]}
        imageFit="contain"
        interactiveFooter={{ kind: "carousel", title: "1 Color", thumbnails }}
      />,
    );
    // Then the full image is shown
    expect(r.tableCardView_image).toHaveStyle({ objectFit: "contain" });
  });

  it("renders progress and carousel stacked", async () => {
    // Given a card with both progress and a thumbnail carousel
    const thumbnails = [{ id: "mv:1", imgUrl: "chrome.png", label: "Chrome", to: "/mv/1" }];
    // When rendered
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        data={[]}
        progress={40}
        height={480}
        interactiveFooter={{ kind: "carousel", title: "1 Color", thumbnails }}
      />,
      { at: { url: "/" } },
    );
    // Then both footer sections render
    expect(r.tableCardView_progressValue).toHaveTextContent("40%");
    expect(r.tableCardView_carouselTitle).toHaveTextContent("1 Color");
    expect(r.tableCardView_carousel_item_0).toHaveAttribute("href", "/mv/1");
  });

  it("shows overflow arrows when the thumbnail strip scrolls", async () => {
    // Given many thumbnails that overflow the strip
    const thumbnails = Array.from({ length: 8 }, (_, i) => ({
      id: `mv:${i}`,
      imgUrl: `s${i}.png`,
      label: `Color ${i}`,
      to: `/mv/${i}`,
    }));
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        data={[]}
        interactiveFooter={{ kind: "carousel", title: "8 Variants", thumbnails }}
      />,
      { at: { url: "/" } },
    );
    // And the strip reports overflow to the right
    Object.defineProperty(r.tableCardView_carousel_items, "scrollWidth", { configurable: true, value: 400 });
    Object.defineProperty(r.tableCardView_carousel_items, "clientWidth", { configurable: true, value: 100 });
    Object.defineProperty(r.tableCardView_carousel_items, "scrollLeft", { configurable: true, value: 0 });
    fireEvent.scroll(r.tableCardView_carousel_items);
    // Then the next arrow is available
    expect(r.tableCardView_carousel_next).toBeInTheDocument();
    expect(r.query.tableCardView_carousel_prev).not.toBeInTheDocument();
  });

  it("renders the card content as a link when the row links", async () => {
    // Given a card with a row link
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} to="/item/1" />, {
      at: { url: "/" },
    });
    // Then the card's content is a single link, named by the title
    expect(r.tableCardView_action.tagName).toBe("A");
    expect(r.tableCardView_action).toHaveAttribute("href", "/item/1");
    expect(r.tableCardView_action).toHaveAttribute("aria-label", "123 Main St");
    // And it holds the card's content
    expect(r.tableCardView_action).toContainElement(r.tableCardView_title);
    // And it is a direct child of the card, which is how the card rings for its focus
    expect(r.tableCardView_action.parentElement).toBe(r.tableCardView);
  });

  it("does not render an action for a static card", async () => {
    // Given a card with no row action
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    // Then there is nothing interactive to focus
    expect(r.query.tableCardView_action).not.toBeInTheDocument();
  });

  it("keeps the carousel thumbnails outside of the card's link", async () => {
    // Given a carousel card with a card-level link
    // When rendered
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        data={[]}
        to="/item/1"
        interactiveFooter={{ kind: "carousel", title: "2 Colors", thumbnails }}
      />,
      { at: { url: "/" } },
    );
    // Then the card's link covers its content
    expect(r.tableCardView_action).toHaveAttribute("href", "/item/1");
    // And the thumbnails keep their own links, as siblings of it
    expect(r.tableCardView_carousel_item_0).toHaveAttribute("href", "/mv/1");
    expect(r.tableCardView_action).not.toContainElement(r.tableCardView_carousel_item_0);
  });

  it("gives carousel cards a keyboard-reachable button for their row click", async () => {
    // Given a carousel card with a row click
    const onClick = vi.fn();
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="Forté Showerhead"
        data={[]}
        onClick={onClick}
        interactiveFooter={{ kind: "carousel", title: "2 Colors", thumbnails }}
      />,
      { at: { url: "/" } },
    );
    // Then the action is a real button rather than a click handler on the card div
    expect(r.tableCardView_action.tagName).toBe("BUTTON");
    // And it can be focused and invoked
    r.tableCardView_action.focus();
    expect(r.tableCardView_action).toHaveFocus();
    click(r.tableCardView_action);
    expect(onClick).toHaveBeenCalled();
  });
});
