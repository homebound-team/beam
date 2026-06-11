import { act } from "@testing-library/react";
import { RefObject, useRef } from "react";
import { THRESHOLD, useAutoHideOnScroll } from "src/layouts/useAutoHideOnScroll";
import { render } from "src/utils/rtl";

describe("useAutoHideOnScroll", () => {
  afterEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("starts static and at the top", async () => {
    // Given the hook is enabled at the top of the page
    // When it mounts
    const r = await render(<Harness />);

    // Then state is static and atTop is true
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("hides when scrolling down past the threshold", async () => {
    // Given the hook is mounted at the top
    const r = await render(<Harness />);

    // When scrolling down past the threshold
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, getNavHeight() + THRESHOLD + 20);

    // Then the chrome hides
    expect(r.state).toHaveTextContent("hidden");
    expect(r.atTop).toHaveTextContent("false");
  });

  it("reveals when scrolling back up while still past the threshold", async () => {
    // Given the chrome is hidden after scrolling down
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, 300);
    expect(r.state).toHaveTextContent("hidden");

    // When scrolling back up while still past the threshold
    scrollTo(r.spacer, 250);

    // Then the chrome reveals
    expect(r.state).toHaveTextContent("revealed");
  });

  it("returns to static (not stuck revealed) once scrolled back to the top", async () => {
    // Given the chrome is revealed mid-page
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, 300);
    scrollTo(r.spacer, 250);
    expect(r.state).toHaveTextContent("revealed");

    // When scrolling back to the top
    scrollTo(r.spacer, 0);

    // Then state returns to static
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("holds at the top through negative (iOS) top-overscroll", async () => {
    // Given the hook is at the top
    const r = await render(<Harness />);

    // When rubber-banding past the top (negative scrollY)
    scrollTo(r.spacer, -40);

    // Then the chrome stays static and atTop
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("does not reveal on the upward bounce from bottom-overscroll", async () => {
    // Given the chrome is hidden at the page bottom
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0);
    scrollTo(r.spacer, 300, { maxScroll: 300 });
    expect(r.state).toHaveTextContent("hidden");

    // When overscrolling past the bottom and settling upward
    scrollTo(r.spacer, 320, { maxScroll: 300 });
    scrollTo(r.spacer, 305, { maxScroll: 300 });

    // Then the bottom-overscroll guard keeps it hidden
    expect(r.state).toHaveTextContent("hidden");
  });

  it("stays static when disabled", async () => {
    // Given the hook is disabled
    const r = await render(<Harness enabled={false} />);

    // When scrolling
    scrollTo(r.spacer, 300);

    // Then state stays static
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });

  it("does not reveal when document height changes", async () => {
    // Given the chrome is hidden mid-page
    const r = await render(<Harness />);
    scrollTo(r.spacer, 0, { scrollHeight: 2000 });
    scrollTo(r.spacer, 300, { scrollHeight: 2000 });
    expect(r.state).toHaveTextContent("hidden");

    // When the page grows at the same scroll position (would reveal on scroll-up otherwise)
    scrollTo(r.spacer, 250, { scrollHeight: 4000 });

    // Then the chrome stays hidden
    expect(r.state).toHaveTextContent("hidden");
  });

  it("uses getTopOffset (not 0) as the static / atTop threshold", async () => {
    // Given a placeholder below a 100px top offset (e.g. below a navbar)
    const r = await render(<Harness topOffset={100} />);
    const anchorTop = 150;

    // When scrolling down then partway back up without reaching the offset
    scrollTo(r.spacer, 400, { anchorTop });
    scrollTo(r.spacer, 350, { anchorTop });
    expect(r.state).toHaveTextContent("revealed");
    scrollTo(r.spacer, 80, { anchorTop });

    // Then it stays revealed until rect.top reaches the offset
    expect(r.state).toHaveTextContent("revealed");
    expect(r.atTop).toHaveTextContent("false");

    // When scrolled so rect.top reaches the offset
    scrollTo(r.spacer, 40, { anchorTop });

    // Then it returns to static / atTop (scrollY is still > 0)
    expect(r.state).toHaveTextContent("static");
    expect(r.atTop).toHaveTextContent("true");
  });
});

function getNavHeight(): number {
  return 50;
}

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

/** Fakes document scroll; `anchorTop` positions the placeholder, `maxScroll` controls the atBottom check. */
function scrollTo(
  spacer: HTMLElement,
  y: number,
  opts: { maxScroll?: number; anchorTop?: number; scrollHeight?: number } = {},
) {
  const maxScroll = opts.maxScroll ?? 1_000_000;
  const anchorTop = opts.anchorTop ?? 0;
  const clientHeight = 800;
  const scrollHeight = opts.scrollHeight ?? maxScroll + clientHeight;
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  Object.defineProperty(document.documentElement, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
  const top = anchorTop - y;
  spacer.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + getNavHeight(),
      left: 0,
      right: 0,
      width: 0,
      height: getNavHeight(),
      x: 0,
      y: top,
      toJSON() {},
    }) as DOMRect;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}
