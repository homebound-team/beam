import { AiPanel } from "src";
import { render } from "src/utils/rtl";

describe("AiPanel", () => {
  it("renders title and message", async () => {
    const r = await render(<AiPanel title="Import Plan Data" message="Upload your documents." />);
    expect(r.aiPanel_title).toHaveTextContent("Import Plan Data");
    expect(r.aiPanel_message).toHaveTextContent("Upload your documents.");
  });

  it("omits title and message when not given", async () => {
    // Given an AiPanel with only children
    const r = await render(
      <AiPanel>
        <button>Upload</button>
      </AiPanel>,
    );
    // Then the copy slots stay out of the DOM
    expect(r.query.aiPanel_title).not.toBeInTheDocument();
    expect(r.query.aiPanel_message).not.toBeInTheDocument();
    expect(r.aiPanel_card).toHaveTextContent("Upload");
  });

  it("orders the loader above the title and children below the message", async () => {
    const r = await render(
      <AiPanel loading title="Working" message="Hang tight.">
        <button>Cancel</button>
      </AiPanel>,
    );
    const order = Array.from(r.aiPanel_card.children).map((el) => el.tagName.toLowerCase());
    expect(order).toEqual(["div", "span", "span", "button"]);
    expect(r.aiPanel_card.firstElementChild).toBe(r.aiLoader);
  });

  it("omits the loader unless loading", async () => {
    const r = await render(<AiPanel title="Import Plan Data" />);
    expect(r.query.aiLoader).not.toBeInTheDocument();
  });

  it("is not a live region unless loading", async () => {
    // Given a form or upload panel, i.e. nothing in flight to announce
    const r = await render(<AiPanel title="Import Plan Data" />);
    expect(r.aiPanel).not.toHaveAttribute("role");
    expect(r.aiPanel).not.toHaveAttribute("aria-busy");
  });

  it("announces politely while loading", async () => {
    const r = await render(<AiPanel loading title="We're processing your document..." />);
    expect(r.aiPanel).toHaveAttribute("role", "status");
    expect(r.aiPanel).toHaveAttribute("aria-busy", "true");
  });

  it("lets a caller override the loading announcement", async () => {
    const r = await render(<AiPanel loading role="alert" title="t" />);
    expect(r.aiPanel).toHaveAttribute("role", "alert");
  });

  it("left-aligns copy by default", async () => {
    const r = await render(<AiPanel title="t" message="m" />);
    expect(r.aiPanel_message).toHaveStyle({ textAlign: "left" });
  });

  it("centers copy when asked", async () => {
    const r = await render(<AiPanel align="center" title="t" message="m" />);
    expect(r.aiPanel_message).toHaveStyle({ textAlign: "center" });
  });

  it("stays square by default", async () => {
    const r = await render(<AiPanel title="t" />);
    expect(r.aiPanel).not.toHaveStyle({ borderRadius: "12px" });
  });

  it("rounds its corners when asked", async () => {
    const r = await render(<AiPanel rounded title="t" />);
    expect(r.aiPanel).toHaveStyle({ borderRadius: "12px" });
  });

  it("fills its container's width either way", async () => {
    // `rounded` controls corners only, never width
    const r = await render(<AiPanel rounded title="t" />);
    expect(r.aiPanel).toHaveStyle({ display: "flex" });
    expect(r.aiPanel).not.toHaveStyle({ width: "fit-content" });
  });

  it("lets the banner column fill its container", async () => {
    const r = await render(<AiPanel title="t" />);
    expect(r.aiPanel_column).toHaveStyle({ width: "100%" });
    expect(r.aiPanel_column).not.toHaveStyle({ maxWidth: "768px" });
  });

  it("caps and centers the page column at 768", async () => {
    const r = await render(<AiPanel variant="page" title="t" />);
    expect(r.aiPanel_column).toHaveStyle({ maxWidth: "768px" });
    // Centered by the wash, which keeps filling the container
    expect(r.aiPanel).toHaveStyle({ alignItems: "center" });
    expect(r.aiPanel).not.toHaveStyle({ maxWidth: "768px" });
  });

  // Radius only — the padding helpers compile to `calc(var(--t-spacing) * n)`, which jsdom won't
  // resolve. Padding is checked in the browser instead.
  it("uses the tighter card for the banner variant", async () => {
    const r = await render(<AiPanel title="t" />);
    expect(r.aiPanel_card).toHaveStyle({ borderRadius: "12px" });
  });

  it("uses the roomier card for the page variant", async () => {
    const r = await render(<AiPanel variant="page" title="t" />);
    expect(r.aiPanel_card).toHaveStyle({ borderRadius: "16px" });
  });
});
