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

  it("has no footer strip without progress text", async () => {
    const r = await render(<AiLoadingPanel />);
    expect(r.query.aiLoadingPanel_progressText).toBeNull();
  });

  describe("with progress text", () => {
    it("shows it as-is, and drops the default's vaguer wording", async () => {
      // Given a caller that knows this work usually finishes in 3 minutes
      const r = await render(<AiLoadingPanel progressText="Usually takes about 3 minutes" />);
      // Then the strip quotes it, and the body no longer hedges about "a few minutes"
      expect(r.aiLoadingPanel_progressText).toHaveTextContent("Usually takes about 3 minutes");
      expect(r.aiLoadingPanel_message).toHaveTextContent("Feel free to keep working in another tab.");
      expect(r.aiLoadingPanel_message).not.toHaveTextContent("can take a few minutes");
    });

    it("keeps caller copy in charge of the message", async () => {
      // Given a flow that wants its own wording alongside the strip
      const r = await render(
        <AiLoadingPanel message="We'll email you." progressText="Usually takes about 3 minutes" />,
      );
      // Then the strip is additive rather than overriding
      expect(r.aiLoadingPanel_message).toHaveTextContent("We'll email you.");
      expect(r.aiLoadingPanel_progressText).toHaveTextContent("Usually takes about 3 minutes");
    });

    it("renders an overrun the same way, because deciding that is the caller's job", async () => {
      // Given a caller that has decided the run is late
      const r = await render(<AiLoadingPanel progressText="Taking longer than usual" />);
      // Then we show that without a timer of our own
      expect(r.aiLoadingPanel_progressText).toHaveTextContent("Taking longer than usual");
    });
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
