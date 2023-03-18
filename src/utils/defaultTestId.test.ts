import { defaultTestId } from "src";

describe("defaultTestId", () => {
  it("strips underscore", () => {
    expect(defaultTestId("rpo:4")).toEqual("rpo4");
  });
});
