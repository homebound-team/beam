import { type RefObject, useRef } from "react";
import { useMeasuredHeight } from "src/layouts/useMeasuredHeight";
import { render } from "src/utils/rtl";

describe("useMeasuredHeight", () => {
  it("measures and rounds the element's height on mount", async () => {
    // Given a measured element height of 50.6px
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect(50.6));
    try {
      // When the hook mounts with the element present
      const r = await render(<Harness />);

      // Then the height rounds to 51px
      expect(r.height).toHaveTextContent("51");
    } finally {
      spy.mockRestore();
    }
  });

  it("returns 0 when the measured element is absent (chrome disabled)", async () => {
    // Given chrome is disabled (no measured element)
    // When the hook mounts
    const r = await render(<Harness enabled={false} />);

    // Then the height is 0
    expect(r.height).toHaveTextContent("0");
  });
});

function Harness({ enabled = true }: { enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const height = useMeasuredHeight(ref as RefObject<HTMLElement>, enabled);
  return (
    <div>
      {enabled && <div data-testid="el" ref={ref} />}
      <div data-testid="height">{height}</div>
    </div>
  );
}

function rect(height: number): DOMRect {
  return { height, width: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
}
