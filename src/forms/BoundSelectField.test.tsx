import { createObjectState, ObjectConfig, ObjectState, required } from "@homebound/form-state";
import { click, render } from "@homebound/rtl-utils";
import { BoundSelectField } from "src/forms/BoundSelectField";
import { AuthorInput } from "src/forms/formStateDomain";

const sports = [
  { id: "s:1", name: "Football" },
  { id: "s:2", name: "Soccer" },
];

describe("BoundSelectField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { favoriteSport: "s:1" });
    const r = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    expect(r.favoriteSport()).toHaveValue("Football");
  });

  it("shows the error message", async () => {
    const author = createObjectState(formConfig, {});
    author.favoriteSport.touched = true;
    const r = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    expect(r.favoriteSport_errorMsg()).toHaveTextContent("Required");
  });

  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteSport: "s:1" });
    const r = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    expect(r.favoriteSport_label()).toHaveTextContent("Favorite Sport");
  });

  it("can bind against boolean fields", async () => {
    const author = createObjectState(formConfig, { isAvailable: undefined });
    const options = [
      { label: "Yes", value: true },
      { label: "No", value: false },
      { label: "", value: undefined },
    ];
    const r = await render(
      <BoundSelectField
        field={author.isAvailable}
        options={options}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
      />,
    );
    expect(r.isAvailable()).toHaveValue("");
  });

  it("has the latest value when onChange is triggered", async () => {
    // Given a FormState/ObjectState with an onBlur callback
    const autoSave = jest.fn();
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      { favoriteSport: "s:1" },
      { maybeAutoSave: () => autoSave(author.favoriteSport.value) },
    );
    const r = await render(<BoundSelectField field={author.favoriteSport} options={sports} />);
    // When changing the value
    click(r.favoriteSport);
    click(r.getByRole("option", { name: "Soccer" }));

    // Then formState has the latest value when onBlur is called
    expect(autoSave).toBeCalledWith("s:2");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteSport: { type: "value", rules: [required] },
  isAvailable: { type: "value" },
};
