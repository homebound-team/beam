import { RadioGroupField } from "src/inputs";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

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

  it("shows the required suffix on the label when required", async () => {
    const r = await render(
      <RadioGroupField
        label="Favorite cheese"
        required
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago" },
          { value: "b", label: "Burratta" },
        ]}
      />,
    );
    expect(r.favoriteCheese_label).toHaveTextContent("Favorite cheese *");
  });

  it("does not show the required suffix when not required", async () => {
    const r = await render(
      <RadioGroupField
        label="Favorite cheese"
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago" },
          { value: "b", label: "Burratta" },
        ]}
      />,
    );
    expect(r.favoriteCheese_label).not.toHaveTextContent("*");
  });

  it("supports horizontal layout", async () => {
    const r = await render(
      <RadioGroupField
        label="Favorite cheese"
        layout="horizontal"
        value="a"
        onChange={() => {}}
        options={[
          { value: "a", label: "Asiago" },
          { value: "b", label: "Burratta" },
        ]}
      />,
    );
    // Selection still works in horizontal layout.
    click(r.favoriteCheese_b);
    // The flex container that wraps the option labels uses row direction.
    const optionsContainer = r.container.querySelector(`[data-testid="favoriteCheese_a"]`)!.closest("div")!;
    expect(optionsContainer).toHaveStyle({ "flex-direction": "row" });
  });

  it("renders an image instead of the label/description text when image is provided", async () => {
    const onChange = vi.fn();
    const r = await render(
      <RadioGroupField
        label="Featured image"
        labelStyle="hidden"
        layout="horizontal"
        value="a"
        onChange={onChange}
        options={[
          { value: "a", label: "Pure White", image: "pure-white.png" },
          { value: "b", label: "Off White", image: "off-white.png" },
        ]}
      />,
    );
    // Then each option renders its image
    const inputA = r.container.querySelector(`[data-testid="featuredImage_a"]`)!;
    const image = inputA.closest("label")!.querySelector("img")!;
    expect(image).toHaveAttribute("src", "pure-white.png");
    // And the label is still available to assistive tech
    expect(r.getByText("Pure White")).toBeInTheDocument();
    // And selection still works
    click(r.featuredImage_b);
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
