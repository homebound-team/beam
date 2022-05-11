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
});
