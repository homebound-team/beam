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

  it("can be strongly typed", () => {
    // Pretend that render takes a generic
    const r: FooPageTestIds = null!; // await render<FooPageTestIds>();
    // This pulls back the "root" data-testid of the firstName field
    expect(r.firstName).toHaveAttribute("disabled", true);
    // We can also drill into the TextField's icon
    expect(r.firstName.icon).toHaveAttribute("src", "...");
    // @ts-ignore compile error on tid.badKey
    expect(r.badKey).toEqual({ "data-testid": "badKey" });
  });
});

// Components would declare the test ids they expose
export interface TextFieldIds {
  icon: string;
}

// Pages would declare the test ids they expose
export interface FooPageTestIds {
  // test ids that are themselves components would refer to the component's FooIds type
  firstName: TextFieldIds;
  lastName: TextFieldIds;
  // lists of things could get the Nth test id on the page
  costInCents: PriceFieldIds[];
  // or the page could have regular test ids as well
  startDate: string;
}
