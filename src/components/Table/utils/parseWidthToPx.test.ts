import { parseWidthToPx } from "./columns";

describe("parseWidthToPx", () => {
  it("parses valid pixel values", () => {
    expect(parseWidthToPx("200px", 1000)).toBe(200);
  });

  it("returns null for invalid pixel values", () => {
    expect(parseWidthToPx("NaNpx", 1000)).toBe(null);
  });

  it("parses percentage values when tableWidth is provided", () => {
    expect(parseWidthToPx("50%", 1000)).toBe(500);
  });

  it("rounds percentage conversions", () => {
    expect(parseWidthToPx("33.333%", 1000)).toBe(333);
  });

  it("returns null for percentage values when tableWidth is undefined", () => {
    expect(parseWidthToPx("50%", undefined)).toBe(null);
  });

  it("returns null for invalid percentage values", () => {
    expect(parseWidthToPx("NaN%", 1000)).toBe(null);
  });

  it("returns null for unsupported formats", () => {
    expect(parseWidthToPx("1fr", 1000)).toBe(null);
    expect(parseWidthToPx("calc(100% - 20px)", 1000)).toBe(null);
  });
});
