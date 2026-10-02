import { ContextTag } from "src/components/ContextTag";
import { render } from "src/utils/rtl";

describe("ContextTag", () => {
  it("renders the icon beside the text", async () => {
    // Given a context tag
    // When rendered
    const r = await render(<ContextTag icon="wrench" text="Labor" />);
    // Then it shows the text and the requested icon
    expect(r.contextTag).toHaveTextContent("Labor");
    expect(r.contextTag.querySelector("[data-icon='wrench']")).toBeInTheDocument();
  });
});
