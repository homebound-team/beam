import { shallowEqual } from "src/utils/shallowEqual";

describe("shallowEqual", () => {
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

  it("compares Map values with Object.is", () => {
    // Given two Maps with the same key and different value references
    const first = new Map([["room", { id: "r:1" }]]);
    const second = new Map([["room", { id: "r:1" }]]);

    // When their entries are compared
    // Then nested objects remain distinct
    expect(shallowEqual(first, second)).toBe(false);
  });

  it("detects changed Map keys", () => {
    // Given Maps of the same size with different keys
    const first = new Map([["first", 1]]);
    const second = new Map([["second", 1]]);

    // When their entries are compared
    // Then changed membership is different
    expect(shallowEqual(first, second)).toBe(false);
  });

  it("detects changed Map size", () => {
    // Given a Map with an added entry
    const first = new Map([["first", 1]]);
    const second = new Map([
      ["first", 1],
      ["second", 2],
    ]);

    // When their entries are compared
    // Then the additional entry is different
    expect(shallowEqual(first, second)).toBe(false);
  });

  it("accepts equal Maps regardless of insertion order", () => {
    // Given two Maps with the same entries in different orders
    const first = new Map([
      ["first", 1],
      ["second", 2],
    ]);
    const second = new Map([
      ["second", 2],
      ["first", 1],
    ]);

    // When their entries are compared
    // Then the Maps are shallow equal
    expect(shallowEqual(first, second)).toBe(true);
  });

  it("distinguishes a Map from a non-Map", () => {
    // Given two keyless values of different types
    const first = new Map();
    const second = {};

    // When they are compared
    // Then they are not equal
    expect(shallowEqual(first, second)).toBe(false);
  });

  it("detects changed Set members", () => {
    // Given two Sets with different members
    const first = new Set(["first"]);
    const second = new Set(["second"]);

    // When they are compared
    // Then they are not equal
    expect(shallowEqual(first, second)).toBe(false);
  });

  it("accepts Sets with the same members", () => {
    // Given two Sets with the same members in different orders
    const first = new Set(["first", "second"]);
    const second = new Set(["second", "first"]);

    // When they are compared
    // Then they are equal
    expect(shallowEqual(first, second)).toBe(true);
  });

  it("does not treat distinct keyless non-plain objects as equal", () => {
    // Given two Dates without enumerable own keys
    const first = new Date(0);
    const second = new Date(0);

    // When they are compared
    // Then identity is required
    expect(shallowEqual(first, second)).toBe(false);
  });

  it("keeps plain objects shallow equal", () => {
    // Given two objects that share the same nested value
    const room = { id: "room" };
    const first = { room };
    const second = { room };

    // When they are compared
    // Then their own properties are shallow equal
    expect(shallowEqual(first, second)).toBe(true);
  });
});
