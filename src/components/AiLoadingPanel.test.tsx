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
    expect(r.aiLoadingPanel_card).toHaveAttribute("role", "status");
    expect(r.aiLoadingPanel_card).toHaveAttribute("aria-busy", "true");
  });

  it("omits the wash when omitBg is true", async () => {
    // Given a loading panel sitting on a parent wash
    const r = await render(<AiLoadingPanel omitBg />);
    // Then only the card is rendered, not the panel wash
    expect(r.query.aiLoadingPanel).toBeNull();
    expect(r.aiLoadingPanel_card).toBeInTheDocument();
  });
});
