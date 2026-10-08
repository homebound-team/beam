import { useState } from "react";
import { type RadioFieldOption, RadioGroupField } from "src/inputs/RadioGroupField";
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

  it("shows tooltip via an info icon beside the label", async () => {
    const r = await render(
      <RadioGroupField
        label="Favorite cheese"
        tooltip="What this field is for"
        value="a"
        onChange={() => {}}
        options={[{ value: "a", label: "Asiago" }]}
      />,
    );
    expect(r.favoriteCheese_label_0_tooltip).toHaveAttribute("title", "What this field is for");
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

  describe("thumbnail layout", () => {
    const finishes: RadioFieldOption<string>[] = [
      { value: "chrome", label: "Chrome", imgSrc: "chrome.png" },
      { value: "black", label: "Matte Black", imgSrc: "black.png", description: "Powder coated" },
      { value: "gold", label: "Gold", imgSrc: "gold.png", disabled: "Out of stock" },
    ];

    function TestThumbnails(props: { onChange?: (value: string) => void }) {
      const [value, setValue] = useState<string | undefined>("chrome");
      return (
        <RadioGroupField
          label="Finish"
          layout="thumbnail"
          value={value}
          onChange={(v) => {
            setValue(v);
            props.onChange?.(v);
          }}
          options={finishes}
        />
      );
    }

    it("renders each option as a labelled radio with its image", async () => {
      // When rendering a thumbnail group
      const r = await render(<TestThumbnails />);
      // Then each input is a radio named by its option label, since the thumbnail has no visible text
      expect(r.finish_chrome).toHaveAttribute("type", "radio");
      expect(r.finish_chrome).toHaveAccessibleName("Chrome");
      expect(r.finish_black).toHaveAccessibleName("Matte Black");
      // And the option's description is still announced
      expect(r.finish_black).toHaveAccessibleDescription("Powder coated");
      // And each thumbnail shows its image
      expect(r.finish_chrome.closest("label")!.querySelector("img")).toHaveAttribute("src", "chrome.png");
    });

    it("selects an option when its thumbnail is clicked", async () => {
      // Given a thumbnail group with the first option selected
      const onChange = vi.fn();
      const r = await render(<TestThumbnails onChange={onChange} />);
      expect(r.finish_chrome).toBeChecked();
      // When clicking another thumbnail
      click(r.finish_black);
      // Then it becomes the selected option
      expect(onChange).toHaveBeenCalledWith("black");
      expect(r.finish_black).toBeChecked();
      expect(r.finish_chrome).not.toBeChecked();
      expect(r.finish_black.closest("label")).toHaveAttribute("data-selected", "true");
      // And only the selected thumbnail gets the selected border (jsdom can't resolve token vars, so check the var itself)
      expect(r.finish_black.closest("label")!.style.getPropertyValue("--borderColor")).toBe("var(--b-primary)");
      expect(r.finish_chrome.closest("label")!.style.getPropertyValue("--borderColor")).toBe(
        "var(--b-field-border-default)",
      );
    });

    it("shows the option label as a tooltip, unless there's a disabled reason", async () => {
      // When rendering a thumbnail group with a disabled option
      const r = await render(<TestThumbnails />);
      // Then the disabled option's input is disabled
      expect(r.finish_gold).toBeDisabled();
      // And the tooltips show the label for enabled options, and the reason for the disabled one
      const titles = Array.from(r.container.querySelectorAll(`[data-testid="tooltip"]`)).map((t) =>
        t.getAttribute("title"),
      );
      expect(titles).toEqual(["Chrome", "Matte Black", "Out of stock"]);
    });
  });
});
