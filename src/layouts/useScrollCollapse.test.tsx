import { useScrollCollapse } from "src/layouts/useScrollCollapse";
import { render, scrollWindow } from "src/utils/rtl";

const scrollOpts = { clientHeight: 800, scrollHeight: 1_000_800 };

describe("useScrollCollapse", () => {
  it("starts expanded", async () => {
    // Given the hook is enabled at the top of the page
    // When it mounts
    const r = await render(<Harness restingOffset={100} />);

    // Then it starts out not collapsed
    expect(r.collapsed).toHaveTextContent("false");
  });

  it("collapses when scrolling down past restingOffset", async () => {
    // Given the hook is mounted at the top
    const r = await render(<Harness restingOffset={100} />);

    // When scrolling down past restingOffset
    scrollWindow(0, scrollOpts);
    scrollWindow(300, scrollOpts);

    // Then it collapses
    expect(r.collapsed).toHaveTextContent("true");
  });

  it("re-expands when scrolling back up while still past restingOffset", async () => {
    // Given it's collapsed after scrolling down
    const r = await render(<Harness restingOffset={100} />);
    scrollWindow(0, scrollOpts);
    scrollWindow(300, scrollOpts);
    expect(r.collapsed).toHaveTextContent("true");

    // When scrolling back up — even without reaching restingOffset
    scrollWindow(250, scrollOpts);

    // Then it re-expands
    expect(r.collapsed).toHaveTextContent("false");
  });

  it("expands once scrolled back to the top", async () => {
    // Given it's re-expanded mid-page
    const r = await render(<Harness restingOffset={100} />);
    scrollWindow(0, scrollOpts);
    scrollWindow(300, scrollOpts);
    scrollWindow(250, scrollOpts);
    expect(r.collapsed).toHaveTextContent("false");

    // When scrolling all the way back to the top
    scrollWindow(0, scrollOpts);

    // Then it stays expanded
    expect(r.collapsed).toHaveTextContent("false");
  });

  it("holds expanded through negative (iOS) top-overscroll", async () => {
    // Given the hook is at the top
    const r = await render(<Harness restingOffset={100} />);

    // When rubber-banding past the top (negative scrollY)
    scrollWindow(-40, scrollOpts);

    // Then it stays expanded
    expect(r.collapsed).toHaveTextContent("false");
  });

  it("does not re-expand on document height change alone", async () => {
    // Given it's collapsed mid-page
    const r = await render(<Harness restingOffset={100} />);
    scrollWindow(0, { clientHeight: 800, scrollHeight: 2000 });
    scrollWindow(300, { clientHeight: 800, scrollHeight: 2000 });
    expect(r.collapsed).toHaveTextContent("true");

    // When the page grows at the same scroll position (would re-expand on scroll-up otherwise)
    scrollWindow(250, { clientHeight: 800, scrollHeight: 4000 });

    // Then it stays collapsed
    expect(r.collapsed).toHaveTextContent("true");
  });

  it("ignores scroll while disabled", async () => {
    // Given the hook is disabled
    const r = await render(<Harness restingOffset={100} enabled={false} />);

    // When scrolling past restingOffset
    scrollWindow(300, scrollOpts);

    // Then it stays expanded
    expect(r.collapsed).toHaveTextContent("false");
  });
});

function Harness({ enabled = true, restingOffset }: { enabled?: boolean; restingOffset: number }) {
  const collapsed = useScrollCollapse(enabled, restingOffset);
  return <div data-testid="collapsed">{String(collapsed)}</div>;
}
