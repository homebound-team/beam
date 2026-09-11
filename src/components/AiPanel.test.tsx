import { AiCard, AiPanel } from "src";
import { render } from "src/utils/rtl";

describe("AiPanel", () => {
  it("renders its children", async () => {
    // Given a panel with a child
    const r = await render(
      <AiPanel>
        <button>Upload</button>
      </AiPanel>,
    );
    // Then the child is in the panel, not wrapped in a card
    expect(r.aiPanel).toHaveTextContent("Upload");
    expect(r.query.aiPanel_card).not.toBeInTheDocument();
  });

  it("stays square by default", async () => {
    const r = await render(<AiPanel />);
    expect(r.aiPanel).not.toHaveStyle({ borderRadius: "12px" });
  });

  it("rounds its corners when asked", async () => {
    const r = await render(<AiPanel rounded />);
    expect(r.aiPanel).toHaveStyle({ borderRadius: "12px" });
  });

  it("uses sm background padding by default", async () => {
    // Given a bare panel
    const r = await render(<AiPanel />);
    // Then the background uses sm padding
    expect(r.aiPanel).toHaveStyle({
      paddingTop: "calc(var(--t-spacing) * 2)",
      paddingBottom: "calc(var(--t-spacing) * 2)",
      paddingLeft: "calc(var(--t-spacing) * 3)",
      paddingRight: "calc(var(--t-spacing) * 3)",
    });
  });

  it("uses lg background padding when asked", async () => {
    // Given a panel with lg padding
    const r = await render(<AiPanel padding="lg" />);
    // Then the background uses 24px all around
    expect(r.aiPanel).toHaveStyle({
      paddingTop: "calc(var(--t-spacing) * 3)",
      paddingBottom: "calc(var(--t-spacing) * 3)",
      paddingLeft: "calc(var(--t-spacing) * 3)",
      paddingRight: "calc(var(--t-spacing) * 3)",
    });
  });

  it("does not set assistive attributes by default", async () => {
    // Given a bare panel, i.e. no caller-supplied ARIA
    const r = await render(<AiPanel />);
    // Then it stays inert — announcements belong to whoever fills it
    expect(r.aiPanel).not.toHaveAttribute("role");
    expect(r.aiPanel).not.toHaveAttribute("aria-busy");
  });
});

describe("AiCard", () => {
  it("renders its children in the card", async () => {
    // Given an AiCard with a child
    const r = await render(
      <AiCard>
        <button>Upload</button>
      </AiCard>,
    );
    // Then the child is in the card
    expect(r.aiCard_card).toHaveTextContent("Upload");
  });

  it("fills its parent by default", async () => {
    const r = await render(<AiCard />);
    expect(r.aiCard_column).toHaveStyle({ width: "100%" });
  });

  it("shrinks and centers when not fullWidth", async () => {
    // Given a card that should hug its content
    const r = await render(<AiCard fullWidth={false} />);
    // Then the column shrinks and centers
    expect(r.aiCard_column).toHaveStyle({
      width: "fit-content",
      maxWidth: "100%",
      marginLeft: "auto",
      marginRight: "auto",
    });
    expect(r.aiCard_card).toHaveStyle({ minWidth: "0px" });
  });

  it("uses the lg logo and gap by default", async () => {
    // Given a bare AiCard
    const r = await render(<AiCard />);
    // Then the logo is 24px with a 16px gap
    expect(r.aiCard_column).toHaveStyle({ gap: "calc(var(--t-spacing) * 2)" });
    expect(r.aiCard_column.querySelector("svg")).toHaveStyle({ height: "calc(var(--t-spacing) * 3)" });
  });

  it("uses the sm logo and gap when asked", async () => {
    // Given a small-logo AiCard
    const r = await render(<AiCard size="sm" />);
    // Then the logo is 16px with a 4px gap
    expect(r.aiCard_column).toHaveStyle({ gap: "4px" });
    expect(r.aiCard_column.querySelector("svg")).toHaveStyle({ height: "calc(var(--t-spacing) * 2)" });
  });

  it("forwards ARIA from its caller", async () => {
    const r = await render(<AiCard role="status" aria-busy={true} />);
    expect(r.aiCard_card).toHaveAttribute("role", "status");
    expect(r.aiCard_card).toHaveAttribute("aria-busy", "true");
  });
});
