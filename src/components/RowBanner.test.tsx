import { RowBanner } from "src";
import { click, render } from "src/utils/rtl";

describe("RowBanner", () => {
  it("renders its description", async () => {
    const r = await render(<RowBanner type="error" description="Add Stained Wood Ceiling was not found." />);
    expect(r.rowBanner_description).toHaveTextContent("Add Stained Wood Ceiling was not found.");
  });

  it("uses the error icon when type is error", async () => {
    const r = await render(<RowBanner type="error" description="Not found." />);
    expect(r.rowBanner_type).toHaveAttribute("data-icon", "xCircle");
  });

  it("uses the warning icon when type is warning", async () => {
    const r = await render(<RowBanner type="warning" description="Used as a requirement." />);
    expect(r.rowBanner_type).toHaveAttribute("data-icon", "error");
  });

  it("fires each action", async () => {
    const onKeep = vi.fn();
    const onRemove = vi.fn();
    const r = await render(
      <RowBanner
        type="warning"
        description="Used as a requirement."
        actions={[
          { label: "Keep", onClick: onKeep },
          { label: "Remove", onClick: onRemove },
        ]}
      />,
    );
    click(r.keep);
    click(r.remove);
    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("omits the actions when it has none", async () => {
    const r = await render(<RowBanner type="error" description="Not found." />);
    expect(r.query.reviewMatches).not.toBeInTheDocument();
  });
});
