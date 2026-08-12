import { ImportBanner } from "src";
import { render } from "src/utils/rtl";

describe(ImportBanner, () => {
  it("renders the import copy by default", async () => {
    // Given an ImportBanner with no copy of its own
    const r = await render(<ImportBanner />);
    // Then it falls back to the import flow's copy
    expect(r.importBanner_title).toHaveTextContent("Importing Details...");
    expect(r.importBanner_message).toHaveTextContent("This process can take a few minutes");
    // And the loader is showing
    expect(r.aiLoader).toBeInTheDocument();
  });

  it("accepts its own copy", async () => {
    // Given an ImportBanner with a custom title and message
    const r = await render(<ImportBanner title="Reading your spec..." message="We'll email you." />);
    // Then both are used instead of the defaults
    expect(r.importBanner_title).toHaveTextContent("Reading your spec...");
    expect(r.importBanner_message).toHaveTextContent("We'll email you.");
  });

  it("announces politely while busy", async () => {
    // Given an ImportBanner
    const r = await render(<ImportBanner />);
    // Then it is a status region, so assistive tech waits for a pause rather than interrupting
    expect(r.importBanner).toHaveAttribute("role", "status");
    // And it flags that the surrounding content is still settling
    expect(r.importBanner).toHaveAttribute("aria-busy", "true");
  });
});
