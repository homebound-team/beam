import { Checkbox } from "src/inputs/Checkbox";
import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";

describe("Checkbox", () => {
  it("can set default test ids", async () => {
    const r = await render(<Checkbox label="Test Label" selected={false} onChange={noop} />);
    expect(r.testLabel()).toBeTruthy();
  });

  it("can set explicit test ids", async () => {
    const r = await render(<Checkbox label="Test Label" selected={false} onChange={noop} data-testid="customId" />);
    expect(r.customId()).toBeTruthy();
  });

  it("treats indeterminate as false", async () => {
    // Given an indeterminate checkbox
    const onChange = jest.fn();
    const r = await render(<Checkbox label="Test" selected="indeterminate" onChange={onChange} />);
    // When the user clicks it
    click(r.test);
    // Then it becomes true
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
