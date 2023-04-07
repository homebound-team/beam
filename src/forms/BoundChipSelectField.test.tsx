import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { fireEvent } from "@testing-library/react";
import { BoundChipSelectField } from "src";
import { AuthorInput } from "src/forms/formStateDomain";
import { blur, click, focus, render, wait } from "src/utils/rtl";

describe("BoundChipSelectField", () => {
  it("renders", async () => {
    // Given a BoundChipSelectField within a FormState
    const formState = createObjectState(formConfig, { favoriteSport: "s:2" });
    const r = await render(<BoundChipSelectField field={formState.favoriteSport} options={sports} />);

    // Then expect it to render value and label
    expect(r.favoriteSport()).toHaveTextContent("Soccer");
    expect(r.favoriteSport_label()).toHaveTextContent("Favorite Sport");

    // Should not have a Create New option
    click(r.favoriteSport);
    expect(r.queryByRole("option", { name: "Create new" })).toBeFalsy();
  });

  it("can select a value and fire auto save", async () => {
    // Given a BoundChipSelectField within a FormState without an existing value
    const autoSave = jest.fn();
    const formState: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(formState.favoriteSport.value) },
    );
    const r = await render(<BoundChipSelectField field={formState.favoriteSport} options={sports} />);

    expect(r.favoriteSport()).toHaveTextContent("Select an option");
    // When selecting an option
    click(r.favoriteSport);
    click(r.getByRole("option", { name: "Basketball" }));
    // Then expect it to update
    expect(r.favoriteSport()).toHaveTextContent("Basketball");
    // And expect auto save to be called with the new value
    expect(autoSave).toBeCalledWith("s:3");
  });

  it("fires auto save after `onCreateNew`", async () => {
    // Given a BoundChipSelectField within a FormState without an existing value
    const autoSave = jest.fn();
    const formState: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(formState.favoriteSport.value) },
    );
    const r = await render(
      <BoundChipSelectField
        field={formState.favoriteSport}
        options={sports}
        onCreateNew={async (value) => {
          formState.favoriteSport.set(value);
        }}
      />,
    );

    expect(r.favoriteSport()).toHaveTextContent("Select an option");
    // When selecting an option
    click(r.favoriteSport);
    click(r.getByRole("option", { name: "Create new" }));
    // And when entering a new value
    fireEvent.input(r.favoriteSport_createNewField(), { target: { textContent: "newId" } });
    // And hitting the Enter key
    fireEvent.keyDown(r.favoriteSport_createNewField(), { key: "Enter" });
    // Wait for the async request to finish
    await wait();
    // And expect auto save to be called with the new value
    expect(autoSave).toBeCalledWith("newId");
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
    focus(r.favoriteSport());
    expect(onFocus).toBeCalledTimes(1);
    blur(r.favoriteSport());
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
