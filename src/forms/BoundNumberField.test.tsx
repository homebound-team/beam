import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { act, fireEvent } from "@testing-library/react";
import { Observer } from "mobx-react";
import { BoundNumberField } from "src/forms/BoundNumberField";
import { AuthorInput } from "src/forms/formStateDomain";

describe("BoundNumberField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { heightInInches: 10 });
    const { heightInInches } = await render(<BoundNumberField field={author.heightInInches} />);
    expect(heightInInches()).toHaveValue("10");
  });

  it("can change the current value", async () => {
    const author = createObjectState(formConfig, { heightInInches: 10 });
    const { heightInInches } = await render(<BoundNumberField field={author.heightInInches} />);
    // Given the user types a valid WIP value
    fireEvent.input(heightInInches(), { target: { value: "11" } });
    // Then that value is in the DOM (as controlled by react-aria)
    expect(heightInInches()).toHaveValue("11");
    // And also pushed immediately into the FieldState (i.e. w/o waiting for blur)
    expect(author.heightInInches.value).toEqual(11);
    // And when blur finally does happen
    fireEvent.blur(heightInInches());
    // Then the value is still 11
    expect(author.heightInInches.value).toEqual(11);
  });

  it("doesn't blow up when changing to an invalid value", async () => {
    // Given an initial value of 10
    const author = createObjectState(formConfig, { heightInInches: 10 });
    const { heightInInches } = await render(<BoundNumberField field={author.heightInInches} />);
    // When the user focuses
    fireEvent.focus(heightInInches());
    // And types an invalid, WIP value
    fireEvent.input(heightInInches(), { target: { value: "11b" } });
    // Then that value is technically in the DOM
    expect(heightInInches()).toHaveValue("11b");
    // And we pass a sanitized value into the field state for rules to see
    expect(author.heightInInches.value).toEqual(11);
    // And when the user blurs out
    fireEvent.blur(heightInInches());
    // Then the DOM value is sanitized as well
    expect(heightInInches()).toHaveValue("11");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const { heightInInches_errorMsg } = await render(<BoundNumberField field={author.heightInInches} />);
    expect(heightInInches_errorMsg()).toHaveTextContent("Required");
  });

  it("drops the 'in cents' suffix from labels", async () => {
    const author = createObjectState(formConfig, { royaltiesInCents: 1_00 });
    const r = await render(<BoundNumberField field={author.royaltiesInCents} />);
    expect(r.royalties_label()).toHaveTextContent("Royalties");
    expect(r.royalties_label()).not.toHaveTextContent("Cents");
    expect(r.royalties()).toHaveValue("$1.00");
  });

  it("retains 0 value", async () => {
    const author = createObjectState(formConfig, { royaltiesInCents: 1_00 });
    const { royalties } = await render(<BoundNumberField field={author.royaltiesInCents} />);
    fireEvent.input(royalties(), { target: { value: "0" } });
    fireEvent.blur(royalties());
    expect(royalties()).toHaveValue("$0.00");
  });

  it("retains null value", async () => {
    const author = createObjectState(formConfig, { royaltiesInCents: 1_00 });
    const r = await render(<Observer>{() => <BoundNumberField field={author.royaltiesInCents} />}</Observer>);
    expect(r.royalties()).toHaveValue("$1.00");
    act(() => {
      author.royaltiesInCents.value = undefined;
    });
    expect(author.royaltiesInCents.value).toBeNull();
    expect(r.royalties()).toHaveValue("");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  heightInInches: { type: "value", rules: [required] },
  royaltiesInCents: { type: "value" },
};
