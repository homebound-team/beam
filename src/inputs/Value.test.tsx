import { keyToValue, valueToKey } from "src/inputs/Value";

describe("Value", () => {
  it("can encode and decode values correctly", () => {
    expect(keyToValue(valueToKey("Test"))).toBe("Test");
    expect(keyToValue(valueToKey(""))).toBe("");
    expect(keyToValue(valueToKey(0))).toBe(0);
    expect(keyToValue(valueToKey(1))).toBe(1);
    expect(keyToValue(valueToKey(false))).toBe(false);
    expect(keyToValue(valueToKey(true))).toBe(true);
    expect(keyToValue(valueToKey(undefined))).toBe(undefined);
    expect(keyToValue(valueToKey(null))).toBe(null);
  });
});
