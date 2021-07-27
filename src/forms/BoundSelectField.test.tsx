import { createObjectState, ObjectConfig, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { BoundSelectField } from "src/forms/BoundSelectField";
import { AuthorInput } from "src/forms/formStateDomain";

const sports = [
  { id: "s:1", name: "Football" },
  { id: "s:2", name: "Soccer" },
];

describe("BoundSelectField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { favoriteSport: "s:1" });
    const { favoriteSport } = await render(
      <BoundSelectField field={author.favoriteSport} options={sports} mapOption={idAndName} />,
    );
    expect(favoriteSport()).toHaveValue("Football");
  });

  it("shows the error message", async () => {
    const author = createObjectState(formConfig, {});
    author.favoriteSport.touched = true;
    const { favoriteSport_errorMsg } = await render(
      <BoundSelectField field={author.favoriteSport} options={sports} mapOption={idAndName} />,
    );
    expect(favoriteSport_errorMsg()).toHaveTextContent("Required");
  });

  it("shows the label", async () => {
    const author = createObjectState(formConfig, { favoriteSport: "s:1" });
    const { favoriteSport_label } = await render(
      <BoundSelectField field={author.favoriteSport} options={sports} mapOption={idAndName} />,
    );
    expect(favoriteSport_label()).toHaveTextContent("Favorite Sport");
  });

  it("can bind against boolean fields", async () => {
    const author = createObjectState(formConfig, { isAvailable: undefined });
    const options = [
      { label: "Yes", value: true },
      { label: "No", value: false },
      { label: "", value: undefined },
    ];
    const r = await render(<BoundSelectField field={author.isAvailable} options={options} mapOption={identity} />);
    expect(r.isAvailable()).toHaveValue("");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  favoriteSport: { type: "value", rules: [required] },
  isAvailable: { type: "value" },
};

function identity<T>(o: T): T {
  return o;
}

function idAndName({ id, name }: { id: string; name: string }) {
  return { value: id, label: name };
}
