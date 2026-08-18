import { AiLoadingPanel } from "src";
import { render } from "src/utils/rtl";

describe("AiLoadingPanel", () => {
  it("renders the import copy by default", async () => {
    const r = await render(<AiLoadingPanel />);
    expect(r.aiLoadingPanel_title).toHaveTextContent("Importing Details...");
    expect(r.aiLoadingPanel_message).toHaveTextContent("This process can take a few minutes");
    expect(r.aiLoader).toBeInTheDocument();
  });

  it("accepts its own copy", async () => {
    const r = await render(<AiLoadingPanel title="Reading your spec..." message="We'll email you." />);
    expect(r.aiLoadingPanel_title).toHaveTextContent("Reading your spec...");
    expect(r.aiLoadingPanel_message).toHaveTextContent("We'll email you.");
  });

  it("announces politely while loading", async () => {
    // Given AI work in flight
    const r = await render(<AiLoadingPanel />);
    // Then assistive tech waits for a pause rather than interrupting, and knows content is settling
    expect(r.aiLoadingPanel).toHaveAttribute("role", "status");
    expect(r.aiLoadingPanel).toHaveAttribute("aria-busy", "true");
  });

  it("centers its copy", async () => {
    const r = await render(<AiLoadingPanel />);
    expect(r.aiLoadingPanel_message).toHaveStyle({ textAlign: "center" });
  });
});
