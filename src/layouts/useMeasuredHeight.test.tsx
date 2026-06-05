import { type RefObject, useRef } from "react";
import { useMeasuredHeight } from "src/layouts/useMeasuredHeight";
import { render } from "src/utils/rtl";

function Harness({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const height = useMeasuredHeight(ref as RefObject<HTMLElement>, enabled);
  return (
    <div>
      {/* Mirrors the layouts: the measured element only exists while the chrome is enabled. */}
      {enabled && <div data-testid="el" ref={ref} />}
      <div data-testid="height">{height}</div>
    </div>
  );
}

const rect = (height: number): DOMRect =>
  ({ height, width: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {} }) as DOMRect;

describe("useMeasuredHeight", () => {
  it("measures and rounds the element's height on mount", async () => {
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect(50.6));
    try {
      const r = await render(<Harness />);
      // 50.6 rounds to 51 (the placeholder reserves whole pixels).
      expect(r.height).toHaveTextContent("51");
    } finally {
      spy.mockRestore();
    }
  });

  it("returns 0 when the measured element is absent (chrome disabled)", async () => {
    const r = await render(<Harness enabled={false} />);
    expect(r.height).toHaveTextContent("0");
  });
});
