import { act } from "@testing-library/react";
import { RefObject, useRef } from "react";
import { useAutoHideOnScroll } from "src/layouts/useAutoHideOnScroll";
import { render } from "src/utils/rtl";

const NAV_HEIGHT = 50;
// Mirrors the THRESHOLD constant in useAutoHideOnScroll: scroll past placeholder.bottom by this much to
// commit to fixed positioning.
const THRESHOLD = 80;

function Harness({ enabled = true, topOffset }: { enabled?: boolean; topOffset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const getTopOffset = topOffset != null ? () => topOffset : undefined;
  const { state, atTop } = useAutoHideOnScroll(ref as RefObject<HTMLElement>, enabled, getTopOffset);
  return (
    <div>
      <div data-testid="spacer" ref={ref} />
      <div data-testid="state">{state}</div>
      <div data-testid="atTop">{String(atTop)}</div>
    </div>
  );
}

/**
 * Drives the hook by faking the document scroll position. The placeholder is `anchorTop` px down the
 * document (0 = top, as a navbar; >0 mimics a page header sitting below the navbar), so its
 * `rect.top === anchorTop - scrollY`; `maxScroll` controls the `atBottom` (bottom-overscroll) check.
 */
function scrollTo(spacer: HTMLElement, y: number, opts: { maxScroll?: number; anchorTop?: number } = {}) {
  const maxScroll = opts.maxScroll ?? 1_000_000;
  const anchorTop = opts.anchorTop ?? 0;
  const clientHeight = 800;
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  Object.defineProperty(document.documentElement, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: maxScroll + clientHeight,
    configurable: true,
  });
  const top = anchorTop - y;
  spacer.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + NAV_HEIGHT,
      left: 0,
      right: 0,
      width: 0,
      height: NAV_HEIGHT,
      x: 0,
      y: top,
      toJSON() {},
    }) as DOMRect;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("useAutoHideOnScroll", () => {
  afterEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("starts static and at the top", async () => {
    const r = await render(<Harness />);
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("hides when scrolling down past the threshold", async () => {
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0); // establish lastScrollY at the top
    scrollTo(r.spacer, NAV_HEIGHT + THRESHOLD + 20); // scrolled down past placeholder.bottom + threshold
    expect(r.state).toHaveTextContent("hidden");
    expect(r.atTop).toHaveTextContent("false");
  });

  it("reveals when scrolling back up while still past the threshold", async () => {
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, 300); // down -> hidden
    expect(r.state).toHaveTextContent("hidden");
    scrollTo(r.spacer, 250); // up, still well past threshold -> revealed
    expect(r.state).toHaveTextContent("revealed");
  });

  it("returns to static (not stuck revealed) once scrolled back to the top", async () => {
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, 300);
    scrollTo(r.spacer, 250); // revealed
    expect(r.state).toHaveTextContent("revealed");
    scrollTo(r.spacer, 0); // back at the top
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("holds at the top through negative (iOS) top-overscroll", async () => {
    const r = await render(<Harness />);
    scrollTo(r.spacer, -40); // rubber-band past the top
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("does not reveal on the upward bounce from bottom-overscroll", async () => {
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, 300, { maxScroll: 300 }); // at the page bottom -> hidden
    expect(r.state).toHaveTextContent("hidden");
    scrollTo(r.spacer, 320, { maxScroll: 300 }); // overscroll past the bottom
    scrollTo(r.spacer, 305, { maxScroll: 300 }); // settling upward while still at/over the bottom
    // The settle reads as scroll-up, but the bottom-overscroll guard keeps it from revealing.
    expect(r.state).toHaveTextContent("hidden");
  });

  it("stays static when disabled", async () => {
    const r = await render(<Harness enabled={false} />);
    scrollTo(r.spacer, 300);
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  // A non-zero getTopOffset is how PageHeaderLayout pins below an auto-hiding navbar: the chrome returns
  // to `static`/`atTop` once the placeholder's `rect.top` reaches the offset, not when it reaches 0.
  it("uses getTopOffset (not 0) as the static / atTop threshold", async () => {
    // Placeholder anchored 150px down the document, pinning to a 100px offset (e.g. below a navbar).
    const r = await render(<Harness topOffset={100} />);
    const anchorTop = 150;
    scrollTo(r.spacer, 400, { anchorTop }); // far down -> hidden
    scrollTo(r.spacer, 350, { anchorTop }); // up -> revealed
    expect(r.state).toHaveTextContent("revealed");

    // rect.top = 150 - 80 = 70: back above the viewport top (>= 0) but still short of the 100 offset,
    // so it is NOT yet treated as at-rest — stays revealed.
    scrollTo(r.spacer, 80, { anchorTop });
    expect(r.state).toHaveTextContent("revealed");
    expect(r.atTop).toHaveTextContent("false");

    // rect.top = 150 - 40 = 110 >= 100: now at its anchor, so it returns to static / atTop — and note
    // scrollY is still 40 (> 0), proving this came from the offset, not the scrollY <= 0 guard. (With the
    // default offset of 0, rect.top = 70 would already be at rest — the contrast that proves the offset.)
    scrollTo(r.spacer, 40, { anchorTop });
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });
});
