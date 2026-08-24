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

  it("marks a section active once it is within 120px of the sticky header", async () => {
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

    // When the second section's top sits 120px below the 80px header (the activation lead)
    tops.one = -100;
    tops.two = 200;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // Then the second section is active — offset was read from the layout element, not documentElement
    expect(r.active).toHaveTextContent("two");
  });

  it("keeps the current section active until the next one is within the lead", async () => {
    // Given two sections, with the second still well below the activation line
    document.documentElement.style.setProperty(beamPageHeaderLayoutHeightVar, "0px");
    const tops: Record<string, number> = { one: 80, two: 400 };
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const top = tops[this.id] ?? 0;
      return { top, bottom: top + 40, left: 0, right: 0, width: 0, height: 40, x: 0, y: top, toJSON: () => {} };
    });
    const r = await render(<Harness sectionIds={["one", "two"]} />);

    // When the second section is still more than 120px below the 80px header
    tops.one = -100;
    tops.two = 201;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    // Then the first section stays active
    expect(r.active).toHaveTextContent("one");
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
