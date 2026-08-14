import { AiImportBanner } from "src";
import { render } from "src/utils/rtl";

describe("AiImportBanner", () => {
  it("renders the import copy by default", async () => {
    const r = await render(<AiImportBanner />);
    expect(r.aiImportBanner_title).toHaveTextContent("Importing Details...");
    expect(r.aiImportBanner_message).toHaveTextContent("This process can take a few minutes");
    expect(r.aiLoader).toBeInTheDocument();
  });

  it("accepts its own copy", async () => {
    const r = await render(<AiImportBanner title="Reading your spec..." message="We'll email you." />);
    expect(r.aiImportBanner_title).toHaveTextContent("Reading your spec...");
    expect(r.aiImportBanner_message).toHaveTextContent("We'll email you.");
  });

  it("announces politely while importing", async () => {
    // Given an import in flight
    const r = await render(<AiImportBanner />);
    // Then assistive tech waits for a pause rather than interrupting, and knows content is settling
    expect(r.aiImportBanner).toHaveAttribute("role", "status");
    expect(r.aiImportBanner).toHaveAttribute("aria-busy", "true");
  });

  it("centers its copy", async () => {
    const r = await render(<AiImportBanner />);
    expect(r.aiImportBanner_message).toHaveStyle({ textAlign: "center" });
  });
});
