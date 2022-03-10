import { areArraysEqual, isAbsoluteUrl } from "src/utils/index";

describe("utils index", () => {
  describe("areArraysEqual", () => {
    it("can compare arrays", () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(areArraysEqual([], [])).toBe(true);
      expect(areArraysEqual([1], [2, 3])).toBe(false);
      expect(areArraysEqual([1, 2, 3], [1, 3, 2])).toBe(false);
    });
  });

  describe("isAbsoluteUrl", () => {
    it("can determine absolute urls", () => {
      expect(isAbsoluteUrl("http://www.homebound.com")).toBe(true);
      expect(isAbsoluteUrl("https://www.homebound.com")).toBe(true);
      expect(isAbsoluteUrl("www.homebound.com")).toBe(false);
    });
  });
});
