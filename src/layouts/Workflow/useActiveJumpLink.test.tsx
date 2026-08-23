import { act } from "@testing-library/react";
import { CSSProperties } from "react";
import { Css } from "src/Css";
import { beamPageHeaderLayoutHeightVar } from "src/layouts/layoutVars";
import { render } from "src/utils/rtl";
import { useActiveJumpLink } from "./useActiveJumpLink";

describe("useActiveJumpLink", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(beamPageHeaderLayoutHeightVar);
  });

  it("marks a section active once it reaches the sticky header offset on the layout element", async () => {
    // Given documentElement reports 0 so a root-level read would highlight too early
    document.documentElement.style.setProperty(beamPageHeaderLayoutHeightVar, "0px");
    const tops: Record<string, number> = { one: 200, two: 400 };
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const top = tops[this.id] ?? 0;
      return { top, bottom: top + 40, left: 0, right: 0, width: 0, height: 40, x: 0, y: top, toJSON: () => {} };
    });
    const r = await render(<Harness sectionIds={["one", "two"]} />);
    // Then the first section is active before scroll
    expect(r.active).toHaveTextContent("one");

    // When the second section's top sits at the 80px header offset
    tops.one = -100;
    tops.two = 80;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // Then the second section is active — offset was read from the layout element, not documentElement
    expect(r.active).toHaveTextContent("two");
  });
});

function Harness({ sectionIds }: { sectionIds: string[] }) {
  const activeId = useActiveJumpLink(sectionIds);
  const layoutStyle = { [beamPageHeaderLayoutHeightVar]: "80px" } as CSSProperties;
  return (
    <div style={layoutStyle} css={Css.relative.$}>
      <div data-testid="active">{activeId}</div>
      {sectionIds.map((id) => (
        <div key={id} id={id} style={layoutStyle} />
      ))}
    </div>
  );
}
