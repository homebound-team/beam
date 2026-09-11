import { Css, Palette } from "src/Css";
import { SelectedOptionPill } from "src/forms/SelectedOptionPill";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("SelectedOptionPill", () => {
  it("renders value and helperText", async () => {
    // Given a pill with value and helper text
    // When rendered
    const r = await render(
      <SelectedOptionPill value="CEILBEAM01 Faux Ceiling Beams" helperText="Sources: Page 3" onRemove={() => {}} />,
    );
    // Then both are shown
    expect(r.selectedOptionPill_value).toHaveTextContent("CEILBEAM01 Faux Ceiling Beams");
    expect(r.selectedOptionPill_helperText).toHaveTextContent("Sources: Page 3");
  });

  it("omits the helperText slot when unset", async () => {
    // Given a pill without helperText
    // When rendered
    const r = await render(<SelectedOptionPill value="Option" onRemove={() => {}} />);
    // Then the caption is not in the document
    expect(r.query.selectedOptionPill_helperText).toBeNull();
  });

  it("calls onRemove when the remove button is clicked", async () => {
    // Given a pill with an onRemove handler
    const onRemove = vi.fn();
    const r = await render(<SelectedOptionPill value="Option" onRemove={onRemove} />);
    // When the remove control is clicked
    click(r.selectedOptionPill_remove);
    // Then onRemove is called
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("omits the remove button when disabled", async () => {
    // Given a disabled pill
    // When rendered
    const r = await render(<SelectedOptionPill value="Option" onRemove={() => {}} disabled />);
    // Then the remove control is not in the document
    expect(r.query.selectedOptionPill_remove).toBeNull();
  });

  it("applies the AI background and purple capsule text when aiMode is true", async () => {
    // Given a pill in aiMode
    // When rendered
    const r = await render(<SelectedOptionPill value="Option" onRemove={() => {}} aiMode />);
    // Then the capsule has the AI wash and purple text
    const capsule = r.selectedOptionPill_value.parentElement;
    const backgroundImage = Css.aiBackground.$.backgroundImage ?? "";
    expect(capsule).toHaveStyle({
      backgroundImage,
      color: Palette.Purple800,
    });
  });
});
