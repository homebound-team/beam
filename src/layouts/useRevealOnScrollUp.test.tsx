import { act } from "@testing-library/react";
import { type RefObject, useRef, useState } from "react";
import { HOLD_QUIET_MS, holdRevealWhile, type RevealFrame, useRevealOnScrollUp } from "src/layouts/useRevealOnScrollUp";
import { render, scrollWindow, scrollWindowWithAnchor } from "src/utils/rtl";
import { vi } from "vitest";

describe("useRevealOnScrollUp", () => {
  it("starts resting at the top", async () => {
    // Given the hook at the top of the page
    // When it mounts
    const r = await render(<Harness />);

    // Then state is resting
    expect(r.state).toHaveTextContent("resting");
  });

  it("follows the reserve element until it leaves the viewport, then hides", async () => {
    // Given the hook is mounted at the top
    const r = await render(<Harness />);
    scrollWindowWithAnchor(r.reserveEl, 0);

    // When the reserve element has moved up but is still on screen
    scrollWindowWithAnchor(r.reserveEl, 20);

    // Then the chrome follows the reserve element and keeps the height still below the pin line
    expect(r.state).toHaveTextContent("following");
    expect(r.visible).toHaveTextContent("30");

    // And scrolling back up follows the reserve element instead of pinning
    scrollWindowWithAnchor(r.reserveEl, 10);
    expect(r.state).toHaveTextContent("following");
    expect(r.visible).toHaveTextContent("40");

    // When the reserve element leaves the viewport
    scrollWindowWithAnchor(r.reserveEl, 50);

    // Then the chrome hides
    expect(r.state).toHaveTextContent("hidden");
    expect(r.visible).toHaveTextContent("0");
  });

  it("reveals when scrolling back up while the reserve element is still off screen", async () => {
    // Given the chrome is hidden after scrolling down
    const r = await render(<Harness />);
    scrollWindowWithAnchor(r.reserveEl, 0);
    scrollWindowWithAnchor(r.reserveEl, 300);
    expect(r.state).toHaveTextContent("hidden");

    // When scrolling back up while the reserve element is still off screen
    scrollWindowWithAnchor(r.reserveEl, 250);

    // Then the chrome reveals
    expect(r.state).toHaveTextContent("revealed");
  });

  it("stays revealed while the reserve element comes back, until it is at rest", async () => {
    // Given the chrome was hidden, then pinned by scrolling up
    const r = await render(<Harness />);
    scrollWindowWithAnchor(r.reserveEl, 0);
    scrollWindowWithAnchor(r.reserveEl, 80);
    scrollWindowWithAnchor(r.reserveEl, 70);
    expect(r.state).toHaveTextContent("revealed");

    // When the reserve element is back on screen but the user is still scrolling up
    scrollWindowWithAnchor(r.reserveEl, 20);

    // Then it stays pinned instead of jumping to the reserve element
    expect(r.state).toHaveTextContent("revealed");
    expect(r.visible).toHaveTextContent("50");
  });

  it("returns to resting (not stuck revealed) once scrolled back to the top", async () => {
    // Given the chrome is revealed mid-page
    const r = await render(<Harness />);
    scrollWindowWithAnchor(r.reserveEl, 0);
    scrollWindowWithAnchor(r.reserveEl, 300);
    scrollWindowWithAnchor(r.reserveEl, 250);
    expect(r.state).toHaveTextContent("revealed");

    // When scrolling back to the top
    scrollWindowWithAnchor(r.reserveEl, 0);

    // Then state returns to resting
    expect(r.state).toHaveTextContent("resting");
  });

  it("holds at the top through negative (iOS) top-overscroll", async () => {
    // Given the hook is at the top
    const r = await render(<Harness />);

    // When rubber-banding past the top (negative scrollY)
    scrollWindowWithAnchor(r.reserveEl, -40);

    // Then the chrome stays resting
    expect(r.state).toHaveTextContent("resting");
  });

  it("does not reveal on the upward bounce from bottom-overscroll", async () => {
    // Given the chrome is hidden at the page bottom
    const r = await render(<Harness />);
    scrollWindowWithAnchor(r.reserveEl, 0);
    scrollWindowWithAnchor(r.reserveEl, 300, { maxScroll: 300 });
    expect(r.state).toHaveTextContent("hidden");

    // When overscrolling past the bottom and settling upward
    scrollWindowWithAnchor(r.reserveEl, 320, { maxScroll: 300 });
    scrollWindowWithAnchor(r.reserveEl, 305, { maxScroll: 300 });

    // Then the bottom-overscroll guard keeps it hidden
    expect(r.state).toHaveTextContent("hidden");
  });

  it("does not reveal when document height changes", async () => {
    // Given the chrome is hidden mid-page
    const r = await render(<Harness />);
    scrollWindowWithAnchor(r.reserveEl, 0, { scrollHeight: 2000 });
    scrollWindowWithAnchor(r.reserveEl, 300, { scrollHeight: 2000 });
    expect(r.state).toHaveTextContent("hidden");

    // When the page grows at the same scroll position (would reveal on scroll-up otherwise)
    scrollWindowWithAnchor(r.reserveEl, 250, { scrollHeight: 4000 });

    // Then the chrome stays hidden
    expect(r.state).toHaveTextContent("hidden");
  });

  it("uses getTopOffset (not 0) as the resting threshold", async () => {
    // Given a placeholder below a 100px top offset (e.g. below a navbar)
    const r = await render(<Harness topOffset={100} />);
    const anchorTop = 150;

    // When scrolling down then partway back up without reaching the offset
    scrollWindowWithAnchor(r.reserveEl, 400, { anchorTop });
    scrollWindowWithAnchor(r.reserveEl, 350, { anchorTop });
    expect(r.state).toHaveTextContent("revealed");
    scrollWindowWithAnchor(r.reserveEl, 80, { anchorTop });

    // Then it stays revealed until rect.top reaches the offset
    expect(r.state).toHaveTextContent("revealed");

    // When scrolled so rect.top reaches the offset
    scrollWindowWithAnchor(r.reserveEl, 40, { anchorTop });

    // Then it returns to resting (scrollY is still > 0)
    expect(r.state).toHaveTextContent("resting");
  });

  it("runs the fixed elements top to bottom, whatever order they mount or sit in the DOM", async () => {
    // Given three stacked fixed elements, each 40px, each reading the height of the fixed elements above it
    let scrolled = 0;
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const id = this.getAttribute("data-testid") ?? "";
      if (id === "outer") return box(-scrolled, 40);
      if (id === "middle") return box(40 - scrolled, 40);
      if (id === "inner") return box(80 - scrolled, 40);
      return box(0, 0);
    });
    try {
      scrollWindow(0);
      const r = await render(<Stack />);

      // When all three move up 20px in one scroll
      scrolled = 20;
      scrollWindow(20);

      // Then the outer fixed element is partly on screen, and the two below stay at rest on its new height
      expect(r.outerVisible).toHaveTextContent("20");
      expect(r.middleVisible).toHaveTextContent("40");
      expect(r.innerVisible).toHaveTextContent("40");
    } finally {
      spy.mockRestore();
    }
  });

  describe("holdRevealWhile", () => {
    afterEach(() => {
      // Release any hold a test left behind, since it's module-level state
      window.dispatchEvent(new Event("scrollend"));
      vi.useRealTimers();
    });

    it("keeps hidden chrome hidden while a programmatic scroll moves back up", async () => {
      // Given the chrome is hidden mid-page
      const r = await renderHidden();

      // When a programmatic smooth scroll moves back up, frame by frame
      holdRevealWhile(() => scrollWindowWithAnchor(r.reserveEl, 250));
      scrollWindowWithAnchor(r.reserveEl, 200);

      // Then the chrome stays hidden instead of revealing mid-scroll
      expect(r.state).toHaveTextContent("hidden");

      // And when the scroll ends
      act(() => {
        window.dispatchEvent(new Event("scrollend"));
      });
      // Then it still doesn't reveal over where the scroll landed
      expect(r.state).toHaveTextContent("hidden");

      // But the user's own scroll up reveals it as usual
      scrollWindowWithAnchor(r.reserveEl, 150);
      expect(r.state).toHaveTextContent("revealed");
    });

    it("releases once scrolling goes quiet, for browsers without scrollend", async () => {
      // Given a hidden chrome held by a programmatic scroll
      const r = await renderHidden();
      vi.useFakeTimers();
      holdRevealWhile(() => scrollWindowWithAnchor(r.reserveEl, 250));

      // When the window stops scrolling for long enough, without a scrollend event
      act(() => {
        vi.advanceTimersByTime(HOLD_QUIET_MS);
      });

      // Then the user's next scroll up reveals the chrome
      scrollWindowWithAnchor(r.reserveEl, 200);
      expect(r.state).toHaveTextContent("revealed");
    });

    it("releases as soon as the user scrolls with the wheel", async () => {
      // Given a hidden chrome held by a programmatic scroll
      const r = await renderHidden();
      holdRevealWhile(() => scrollWindowWithAnchor(r.reserveEl, 250));

      // When the user takes over with the wheel
      act(() => {
        window.dispatchEvent(new Event("wheel"));
      });

      // Then their scroll up reveals the chrome as usual
      scrollWindowWithAnchor(r.reserveEl, 200);
      expect(r.state).toHaveTextContent("revealed");
    });

    async function renderHidden() {
      const r = await render(<Harness />);
      scrollWindowWithAnchor(r.reserveEl, 0);
      scrollWindowWithAnchor(r.reserveEl, 300);
      expect(r.state).toHaveTextContent("hidden");
      return r;
    }
  });
});

function Stack() {
  const outerRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const outerHeight = useRef(0);
  const middleHeight = useRef(0);
  const [outerVisible, setOuterVisible] = useState<number>();
  const [middleVisible, setMiddleVisible] = useState<number>();
  const [innerVisible, setInnerVisible] = useState<number>();

  // Subscribed inner first, so registration order alone would run inner before the fixed elements above it.
  useRevealOnScrollUp(innerRef, () => outerHeight.current + middleHeight.current, {
    onScroll: (frame) => setInnerVisible(frame.visibleHeight),
  });
  useRevealOnScrollUp(middleRef, () => outerHeight.current, {
    onScroll: (frame) => {
      middleHeight.current = frame.visibleHeight;
      setMiddleVisible(frame.visibleHeight);
    },
  });
  useRevealOnScrollUp(outerRef, () => 0, {
    onScroll: (frame) => {
      outerHeight.current = frame.visibleHeight;
      setOuterVisible(frame.visibleHeight);
    },
  });

  return (
    <div>
      <div ref={innerRef} data-testid="inner">
        <div data-testid="innerVisible">{innerVisible}</div>
      </div>
      <div ref={middleRef} data-testid="middle">
        <div data-testid="middleVisible">{middleVisible}</div>
      </div>
      <div ref={outerRef} data-testid="outer">
        <div data-testid="outerVisible">{outerVisible}</div>
      </div>
    </div>
  );
}

function box(top: number, height: number): DOMRect {
  return { top, bottom: top + height, left: 0, right: 0, width: 0, height, x: 0, y: top, toJSON() {} } as DOMRect;
}

function Harness({ topOffset }: { topOffset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const getTopOffset = topOffset != null ? () => topOffset : undefined;
  // The hook writes no React state. The scroll callback is what reports each frame.
  const [tracked, setTracked] = useState<RevealFrame | undefined>();
  useRevealOnScrollUp(ref as RefObject<HTMLElement>, getTopOffset, { onScroll: setTracked });
  return (
    <div>
      <div data-testid="reserveEl" ref={ref} />
      <div data-testid="state">{tracked?.state}</div>
      <div data-testid="visible">{tracked?.visibleHeight}</div>
    </div>
  );
}
