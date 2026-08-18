import { AiPanel } from "src";
import { render } from "src/utils/rtl";

describe("AiPanel", () => {
  it("renders its children in the card", async () => {
    const r = await render(
      <AiPanel>
        <button>Upload</button>
      </AiPanel>,
    );
    expect(r.aiPanel_card).toHaveTextContent("Upload");
  });

  it("stays square by default", async () => {
    const r = await render(<AiPanel />);
    expect(r.aiPanel).not.toHaveStyle({ borderRadius: "12px" });
  });

  it("rounds its corners when asked", async () => {
    const r = await render(<AiPanel rounded />);
    expect(r.aiPanel).toHaveStyle({ borderRadius: "12px" });
  });

  it("fills the card by default", async () => {
    const r = await render(<AiPanel />);
    expect(r.aiPanel_column).toHaveStyle({ width: "100%" });
  });

  it("shrinks and centers the card when not fullWidth", async () => {
    const r = await render(<AiPanel fullWidth={false} />);
    // Background still spans, only the card column shrinks
    expect(r.aiPanel).toHaveStyle({ width: "100%" });
    expect(r.aiPanel_column).toHaveStyle({ width: "fit-content", marginLeft: "auto", marginRight: "auto" });
  });

  it("does not set assistive attributes by default", async () => {
    // Given a bare panel, i.e. no caller-supplied ARIA
    const r = await render(<AiPanel />);
    // Then it stays inert — announcements belong to whoever fills it
    expect(r.aiPanel).not.toHaveAttribute("role");
    expect(r.aiPanel).not.toHaveAttribute("aria-busy");
  });

  it("forwards ARIA from its caller", async () => {
    const r = await render(<AiPanel role="status" aria-busy={true} />);
    expect(r.aiPanel).toHaveAttribute("role", "status");
    expect(r.aiPanel).toHaveAttribute("aria-busy", "true");
  });
});
