import { act } from "@testing-library/react";
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

  it("has no footer strip without an estimate", async () => {
    const r = await render(<AiLoadingPanel />);
    expect(r.query.aiLoadingPanel_estimate).toBeNull();
  });

  describe("with an estimate", () => {
    it("shows it, and drops the default's vaguer wording", async () => {
      // Given recent runs that usually finish in 3 minutes
      const r = await render(<AiLoadingPanel estimateInSeconds={180} />);
      // Then the strip quotes it, and the body no longer hedges about "a few minutes"
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Usually about 3 minutes");
      expect(r.aiLoadingPanel_message).toHaveTextContent("Feel free to keep working in another tab.");
      expect(r.aiLoadingPanel_message).not.toHaveTextContent("can take a few minutes");
    });

    it("rounds a sub-minute estimate rather than saying zero minutes", async () => {
      const r = await render(<AiLoadingPanel estimateInSeconds={20} />);
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Usually less than a minute");
    });

    it("keeps caller copy in charge of the message", async () => {
      // Given a flow that wants its own wording alongside the estimate
      const r = await render(<AiLoadingPanel message="We'll email you." estimateInSeconds={180} />);
      // Then the strip is additive rather than overriding
      expect(r.aiLoadingPanel_message).toHaveTextContent("We'll email you.");
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Usually about 3 minutes");
    });
  });

  describe("when the run overruns", () => {
    it("admits it once the run is half again past the estimate", async () => {
      // Given a 3 minute estimate, i.e. unusual after 4:30
      const r = await render(<AiLoadingPanel estimateInSeconds={180} />);
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Usually about 3 minutes");
      // When it is still going past that
      act(() => void vi.advanceTimersByTime(271_000));
      // Then we stop quoting an estimate we've already missed
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Taking longer than usual");
    });

    it("holds the estimate until the threshold", async () => {
      // Given the same run, past its 3 minutes but inside the 4:30 threshold
      const r = await render(<AiLoadingPanel estimateInSeconds={180} />);
      act(() => void vi.advanceTimersByTime(240_000));
      // Then we have not given up on it yet
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Usually about 3 minutes");
    });

    it("gives short estimates a floor of extra slack before crying wolf", async () => {
      // Given a 10s estimate, where a bare 1.5x would call it late at 15s
      const r = await render(<AiLoadingPanel estimateInSeconds={10} />);
      // When 50s have passed
      act(() => void vi.advanceTimersByTime(15_000));
      // Then it is still inside the minimum floor of a minute
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Usually less than a minute");
      // And only past that floor do we call it late
      act(() => void vi.advanceTimersByTime(60_000));
      expect(r.aiLoadingPanel_estimate).toHaveTextContent("Taking longer than usual");
    });

    it("never gives up when there is no estimate to miss", async () => {
      // Given a panel with no estimate at all
      const r = await render(<AiLoadingPanel />);
      // When a long time passes
      act(() => void vi.advanceTimersByTime(3_600_000));
      // Then there is still nothing to say about timing
      expect(r.query.aiLoadingPanel_estimate).toBeNull();
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
