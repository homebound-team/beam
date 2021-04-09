import { useTestIds } from "src/utils/useTestIds";

describe("useTestIds", () => {
  it("can generate a prefixed test id", () => {
    const tid = useTestIds({ "data-testid": "profile" });
    expect(tid.firstName).toEqual({ "data-testid": "profile_firstName" });
  });

  it("can generate a non-prefixed test id", () => {
    const tid = useTestIds({});
    expect(tid.firstName).toEqual({ "data-testid": "firstName" });
  });

  it("can be spread the root id directly", () => {
    const tid = useTestIds({ "data-testid": "firstName" });
    expect({ ...tid }).toEqual({ "data-testid": "firstName" });
  });
});
