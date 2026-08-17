import { AiImporting } from "src";
import { render } from "src/utils/rtl";

describe("AiImporting", () => {
  it("renders the import copy by default", async () => {
    const r = await render(<AiImporting />);
    expect(r.aiImporting_title).toHaveTextContent("Importing Details...");
    expect(r.aiImporting_message).toHaveTextContent("This process can take a few minutes");
    expect(r.aiLoader).toBeInTheDocument();
  });

  it("accepts its own copy", async () => {
    const r = await render(<AiImporting title="Reading your spec..." message="We'll email you." />);
    expect(r.aiImporting_title).toHaveTextContent("Reading your spec...");
    expect(r.aiImporting_message).toHaveTextContent("We'll email you.");
  });

  it("announces politely while importing", async () => {
    // Given an import in flight
    const r = await render(<AiImporting />);
    // Then assistive tech waits for a pause rather than interrupting, and knows content is settling
    expect(r.aiImporting).toHaveAttribute("role", "status");
    expect(r.aiImporting).toHaveAttribute("aria-busy", "true");
  });

  it("centers its copy", async () => {
    const r = await render(<AiImporting />);
    expect(r.aiImporting_message).toHaveStyle({ textAlign: "center" });
  });
});
