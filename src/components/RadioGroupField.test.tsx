import { click, render } from "@homebound/rtl-utils";
import { RadioGroupField } from "src/components/RadioGroupField";

describe("RadioGroupField", () => {
  it("renders with just labels", async () => {
    const r = await render(
      <RadioGroupField
        label={"Favorite cheese"}
        value="a"
        onChange={() => {}}
        options={[
          { label: "Asiago", value: "a" },
          { label: "Burratta", value: "b" },
        ]}
      />,
    );
    expect(r.baseElement).toMatchSnapshot();
  });

  it("renders with just labels and description", async () => {
    const r = await render(
      <RadioGroupField
        label={"Favorite cheese"}
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago" },
          {
            value: "b",
            label: "Burratta",
            description: "Burrata is an Italian cow milk cheese made from mozzarella and cream.",
          },
        ]}
      />,
    );
    expect(r.baseElement).toMatchSnapshot();
  });

  it("has data-testids for its options", async () => {
    const r = await render(
      <RadioGroupField
        label={"Favorite cheese"}
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago" },
          { value: "b", label: "Burratta" },
        ]}
      />,
    );
    click(r.favoriteCheese_a);
  });
});
