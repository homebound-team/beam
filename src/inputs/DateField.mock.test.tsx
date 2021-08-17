import { DateField as MockDateField } from "./DateField.mock";
import { render, type } from "src/utils/rtl";

describe("MockDateField", () => {
  it("formats date value when provided", async () => {
    const r = await render( <MockDateField value={new Date(2020, 0, 1)} onChange={() => {}} /> );
    expect(r.date()).toHaveValue("01/01/20");
  });

  it("fires onChange with selected date", async () => {
    const onChange = jest.fn();
    const r = await render( <MockDateField value={undefined} onChange={onChange} /> );
    // When we change the date
    type(r.date, "02/11/20");
    // Then onChange was called with parsed date
    expect(onChange).toHaveBeenCalledWith(new Date(2020, 1, 11));
    expect(r.date()).toHaveValue("02/11/20");
  });
});
