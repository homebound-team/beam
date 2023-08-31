import { render } from "src/utils/rtl";
import { Chips } from "./Chips";

describe("Chips", () => {
  const values = [
    { text: "123", title: "tooltip" },
    { text: "abc", title: "" },
  ];
  it("renders", async () => {
    const r = await render(<Chips values={values} />);
    expect(r.chip_0.textContent).toBe("123");
    expect(r.chip_1.textContent).toBe("abc");
    expect(r.tooltip).toHaveAttribute("title", "tooltip");
  });

  it("can set compact to change size to xs", async () => {
    const r = await render(<Chips values={values} compact />);
    expect(r.chip_0)
      .toHaveStyleRule("font-size", "12px")
      .toHaveStyleRule("font-weight", "400")
      .toHaveStyleRule("line-height", "16px");
  });
});
