import { RadioGroupField } from "src/inputs";
import { click, render } from "src/utils/rtl";

describe("RadioGroupField", () => {
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

  it("should disable only first option", async () => {
    const r = await render(
      <RadioGroupField
        label={"Favorite cheese"}
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago", disabled: true },
          { value: "b", label: "Burratta" },
        ]}
      />,
    );
    const radioInput = r.container.querySelector(`[data-testid="favoriteCheese_a"]`)!;
    expect(radioInput).toBeDisabled();
  });

  it("should disable first option and have a tooltip", async () => {
    const r = await render(
      <RadioGroupField
        label={"Favorite cheese"}
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago", disabled: "some reason" },
          { value: "b", label: "Burratta" },
        ]}
      />,
    );
    const tooltip = r.container.querySelector(`[data-testid="tooltip"]`)!;
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute("title", "some reason");
  });
});
