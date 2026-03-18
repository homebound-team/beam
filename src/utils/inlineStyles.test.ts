import { clearInlineStyles, setInlineStyles } from "src/utils/inlineStyles";

describe("inlineStyles", () => {
  it("sets and clears inline styles", () => {
    const el = document.createElement("div");
    const styles = { color: "red", zIndex: 2, "--beam-test": "1" };

    setInlineStyles(el, styles);

    expect(el.style.color).toBe("red");
    expect(el.style.zIndex).toBe("2");
    expect(el.style.getPropertyValue("--beam-test")).toBe("1");

    clearInlineStyles(el, styles);

    expect(el.style.color).toBe("");
    expect(el.style.zIndex).toBe("");
    expect(el.style.getPropertyValue("--beam-test")).toBe("");
  });

  it("ignores non-inline values", () => {
    const el = document.createElement("div");

    setInlineStyles(el, { color: "red", transform: undefined, nested: { opacity: 0 } });

    expect(el.style.color).toBe("red");
    expect(el.style.transform).toBe("");
    expect(el.getAttribute("style")).not.toContain("nested");
  });
});
