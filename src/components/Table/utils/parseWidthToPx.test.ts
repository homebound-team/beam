import { parseWidthToPx } from "./columns";

// TODO: check if we need all these tests
describe("parseWidthToPx", () => {
  it("parses pixel values", () => {
    expect(parseWidthToPx("200px", 1000)).toBe(200);
    expect(parseWidthToPx("0px", 1000)).toBe(0);
    expect(parseWidthToPx("999px", 1000)).toBe(999);
  });

  it("parses percentage values when tableWidth is provided", () => {
    expect(parseWidthToPx("50%", 1000)).toBe(500);
    expect(parseWidthToPx("25%", 800)).toBe(200);
    expect(parseWidthToPx("100%", 500)).toBe(500);
  });

  it("returns null for percentage values when tableWidth is undefined", () => {
    expect(parseWidthToPx("50%", undefined)).toBe(null);
  });

  it("returns null for invalid pixel values", () => {
    expect(parseWidthToPx("invalidpx", 1000)).toBe(null);
    expect(parseWidthToPx("NaNpx", 1000)).toBe(null);
  });

  it("returns null for invalid percentage values", () => {
    expect(parseWidthToPx("invalid%", 1000)).toBe(null);
    expect(parseWidthToPx("NaN%", 1000)).toBe(null);
  });

  it("returns null for calc expressions", () => {
    expect(parseWidthToPx("calc(100% - 20px)", 1000)).toBe(null);
  });

  it("returns null for fr units", () => {
    expect(parseWidthToPx("1fr", 1000)).toBe(null);
    expect(parseWidthToPx("2fr", 1000)).toBe(null);
  });

  it("returns null for unsupported units", () => {
    expect(parseWidthToPx("20em", 1000)).toBe(null);
    expect(parseWidthToPx("5rem", 1000)).toBe(null);
  });

  it("rounds percentage conversions", () => {
    expect(parseWidthToPx("33.333%", 1000)).toBe(333);
    expect(parseWidthToPx("66.666%", 1000)).toBe(667);
  });
});
