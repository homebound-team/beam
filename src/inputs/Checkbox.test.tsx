import { Checkbox } from "src/inputs/Checkbox";
import { noop } from "src/utils";
import { render } from "src/utils/rtl";

describe("Checkbox", () => {
  it("can set default test ids", async () => {
    const r = await render(<Checkbox label="Test Label" onChange={noop} />);
    expect(r.testLabel()).toBeTruthy();
  });

  it("can set explicit test ids", async () => {
    const r = await render(<Checkbox label="Test Label" onChange={noop} data-testid="customId" />);
    expect(r.customId()).toBeTruthy();
  });
});
