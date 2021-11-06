import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { fireEvent } from "@testing-library/react";
import { BoundChipSelectField } from "src/forms/BoundChipSelectField";
import { AuthorInput } from "src/forms/formStateDomain";
import { click, render } from "src/utils/rtl";

describe("BoundChipSelectField", () => {
  it("renders", async () => {
    // Given a BoundChipSelectField within a FormState
    const formState = createObjectState(formConfig, { favoriteSport: "s:2" });
    const r = await render(<BoundChipSelectField field={formState.favoriteSport} options={sports} />);

    // Then expect it to render value and label
    expect(r.favoriteSport()).toHaveTextContent("Soccer");
    expect(r.favoriteSport_label()).toHaveTextContent("Favorite Sport");
  });

  it("can select a value", async () => {
    // Given a BoundChipSelectField within a FormState without an existing value
    const formState = createObjectState(formConfig, {});
    const r = await render(<BoundChipSelectField field={formState.favoriteSport} options={sports} />);

    expect(r.favoriteSport()).toHaveTextContent("Select an option");
    // When selecting an option
    click(r.favoriteSport);
    click(r.getByRole("option", { name: "Basketball" }));
    // Then expect it to update
    expect(r.favoriteSport()).toHaveTextContent("Basketball");
  });

  it("can fire callbacks", async () => {
    // Given a BoundChipSelectField within a FormState with explicit `onFocus` and `onBlur` callbacks
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const formState = createObjectState(formConfig, { favoriteSport: "s:2" });
    const r = await render(
      <BoundChipSelectField field={formState.favoriteSport} options={sports} onFocus={onFocus} onBlur={onBlur} />,
    );

    // When firing the events, expect the callbacks to be fired
    fireEvent.focus(r.favoriteSport());
    expect(onFocus).toBeCalledTimes(1);
    fireEvent.blur(r.favoriteSport());
    expect(onBlur).toBeCalledTimes(1);
  });

  it("can set custom testid", async () => {
    // Given a BoundChipSelectField with a custom testid
    const formState = createObjectState(formConfig, {});
    const r = await render(
      <BoundChipSelectField field={formState.favoriteSport} options={sports} data-testid="customTestId" />,
    );

    // Then expect that testid to be set
    expect(r.customTestId()).toBeTruthy();
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteSport: { type: "value", rules: [required] },
};

const sports = [
  { id: "s:1", name: "Football" },
  { id: "s:2", name: "Soccer" },
  { id: "s:3", name: "Basketball" },
  { id: "s:4", name: "Baseball" },
];
