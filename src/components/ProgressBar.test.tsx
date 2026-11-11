import { ProgressBar } from "src/components/ProgressBar";
import { render } from "src/utils/rtl";

describe("ProgressBar", () => {
  it("renders the value as a percentage", async () => {
    // Given a progress value
    // When rendered
    const r = await render(<ProgressBar value={65} />);
    // Then the label and fill both reflect it
    expect(r.progressBar_value).toHaveTextContent("65%");
    expect(r.progressBar_fill).toHaveStyle({ width: "65%" });
  });

  it("floors fractional values in the label but not the fill", async () => {
    // Given a value just short of complete
    // When rendered
    const r = await render(<ProgressBar value={99.6} />);
    // Then the label doesn't claim 100% early, while the fill stays exact
    expect(r.progressBar_value).toHaveTextContent("99%");
    expect(r.progressBar_fill).toHaveStyle({ width: "99.6%" });
  });

  it("clamps values outside 0-100", async () => {
    // Given a value above 100
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // When rendered
    const r = await render(<ProgressBar value={150} />);
    // Then it's clamped to 100 and warns about the bad input
    expect(r.progressBar_value).toHaveTextContent("100%");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("150"));
  });
});
