import { shallowEqual } from "src/utils/shallowEqual";

describe("shadowEqual", () => {
  it("is true for the same arrays", () => {
    const a1 = [1, 2, 3];
    const a2 = [1, 2, 3];
    expect(shallowEqual(a1, a2)).toBe(true);
  });

  it("is true for the same arrays of strings", () => {
    const a1 = ["a", "B"];
    const a2 = ["a", "B"];
    expect(shallowEqual(a1, a2)).toBe(true);
  });
});
