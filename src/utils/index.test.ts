import { areArraysEqual, isAbsoluteUrl, pluralize } from "src/utils/index";

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

  describe("pluralize", () => {
    it("provides singular on count", () => {
      expect(pluralize(1, "item")).toBe("item");
    });

    it("provides plural on count", () => {
      expect(pluralize(2, "item")).toBe("items");
    });

    it("provides plural on zero", () => {
      expect(pluralize(0, "item")).toBe("items");
    });

    it("provides singular on array", () => {
      expect(pluralize([{}], "item")).toBe("item");
    });

    it("provides plural on array", () => {
      expect(pluralize([{}, {}], "item")).toBe("items");
    });

    it("provides plural on 0-item array", () => {
      expect(pluralize([], "item")).toBe("items");
    });

    it("returns custom plural", () => {
      expect(pluralize(2, "potato", "potatoes")).toBe("potatoes");
      expect(pluralize([{}, {}], "potato", "potatoes")).toBe("potatoes");
    });

    it("handles undefined", () => {
      expect(pluralize(undefined as any, "item")).toBe("items");
    });
  });
});
