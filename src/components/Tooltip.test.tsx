import { resolveTooltip } from "src/components/Tooltip";

describe("Tooltip", () => {
  it("can resolve tooltip text", () => {
    const disabledNode = <div>Tooltip Node</div>;

    // Resolves to undefined if neither option is set
    expect(resolveTooltip(false)).toBe(undefined);
    expect(resolveTooltip(true, null)).toBe(undefined);

    // `disabled` param should always trump `tooltip` and `readOnly` params
    expect(resolveTooltip("Test")).toBe("Test");
    expect(resolveTooltip("Test", "Test 2")).toBe("Test");
    expect(resolveTooltip(disabledNode, "Test 2")).toBe(disabledNode);

    // `readOnly` param should always trump `tooltip` param
    expect(resolveTooltip(false, undefined, "read only")).toBe("read only");
    expect(resolveTooltip(true, "test", "read only")).toBe("read only");
    expect(resolveTooltip(undefined, "test", "read only")).toBe("read only");

    // Can show tooltip text if `disabled` is not set
    expect(resolveTooltip(false, "Test 2")).toBe("Test 2");
    expect(resolveTooltip(true, "Test 2")).toBe("Test 2");
    expect(resolveTooltip(undefined, "Test 2")).toBe("Test 2");
    expect(resolveTooltip(undefined, "Test 2", true)).toBe("Test 2");
    expect(resolveTooltip(undefined, "Test 2", "")).toBe("Test 2");
  });
});
