import { fireEvent } from "@testing-library/react";
import { Carousel } from "src/components/Carousel";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("Carousel", () => {
  const items = Array.from({ length: 8 }, (_, i) => <div key={i}>{`Item ${i}`}</div>);

  /** jsdom has no layout, so fake the strip overflowing by `scrollWidth` px. */
  function setOverflow(strip: HTMLElement, opts: { scrollLeft: number; clientWidth: number; scrollWidth: number }) {
    for (const [key, value] of Object.entries(opts)) {
      Object.defineProperty(strip, key, { configurable: true, value });
    }
    fireEvent.scroll(strip);
  }

  it("hides both chevrons when the items fit", async () => {
    // Given a carousel whose items fit
    const r = await render(<Carousel>{items}</Carousel>);
    // Then neither chevron is shown
    expect(r.query.carousel_prev).not.toBeInTheDocument();
    expect(r.query.carousel_next).not.toBeInTheDocument();
  });

  it("shows the forward chevron once there is more to scroll to", async () => {
    // Given a carousel with more items than fit
    const r = await render(<Carousel>{items}</Carousel>);
    // When the strip overflows to the right
    setOverflow(r.carousel_items, { scrollLeft: 0, clientWidth: 100, scrollWidth: 400 });
    // Then only the forward chevron is shown
    expect(r.carousel_next).toBeInTheDocument();
    expect(r.query.carousel_prev).not.toBeInTheDocument();
  });

  it("shows the back chevron once the strip has been scrolled", async () => {
    // Given a carousel scrolled to its end
    const r = await render(<Carousel>{items}</Carousel>);
    // When the strip overflows to the left
    setOverflow(r.carousel_items, { scrollLeft: 300, clientWidth: 100, scrollWidth: 400 });
    // Then only the back chevron is shown
    expect(r.carousel_prev).toBeInTheDocument();
    expect(r.query.carousel_next).not.toBeInTheDocument();
  });

  it("scrolls a page at a time", async () => {
    // Given a carousel that can scroll forward
    const r = await render(<Carousel>{items}</Carousel>);
    const scrollBy = vi.fn();
    r.carousel_items.scrollBy = scrollBy;
    setOverflow(r.carousel_items, { scrollLeft: 0, clientWidth: 120, scrollWidth: 400 });
    // When scrolling forward
    click(r.carousel_next);
    // Then the strip moves by its visible width, rather than a fixed guess
    expect(scrollBy).toHaveBeenCalledWith({ left: 120, behavior: "smooth" });
  });

  it("snaps its items into place", async () => {
    // Given a carousel
    const r = await render(<Carousel>{items}</Carousel>);
    // Then the strip snaps horizontally, and each item is a snap point
    expect(getComputedStyle(r.carousel_items).scrollSnapType).toBe("x mandatory");
    expect(getComputedStyle(r.carousel_items.children[0]).scrollSnapAlign).toBe("start");
  });

  it("uses the given labels for its chevrons", async () => {
    // Given a carousel with custom labels
    const r = await render(
      <Carousel prevLabel="Previous variant" nextLabel="Next variant">
        {items}
      </Carousel>,
    );
    // When the strip overflows in both directions
    setOverflow(r.carousel_items, { scrollLeft: 10, clientWidth: 100, scrollWidth: 400 });
    // Then the chevrons are named for the caller's items
    expect(r.carousel_prev).toHaveAttribute("aria-label", "Previous variant");
    expect(r.carousel_next).toHaveAttribute("aria-label", "Next variant");
  });
});
