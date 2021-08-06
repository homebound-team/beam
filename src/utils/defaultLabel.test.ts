import { defaultLabel } from "src/utils/defaultLabel";

describe("defaultLabel", () => {
  it("strips id suffix", () => {
    expect(defaultLabel("marketId")).toEqual("Market");
  });

  it("strips ids suffix", () => {
    expect(defaultLabel("marketIds")).toEqual("Market");
  });
});
