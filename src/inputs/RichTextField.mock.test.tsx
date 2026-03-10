import { noop } from "src/utils";
import { render, type } from "src/utils/rtl";
import { vi } from "vitest";
import { RichTextFieldMock } from "./RichTextField.mock";

describe("RichTextFieldMock", () => {
  it("fires onChange with text content", async () => {
    const onChange = vi.fn();
    const text = "This is some content";
    const r = await render(<RichTextFieldMock value={""} onChange={onChange} onBlur={noop} onFocus={noop} />);
    type(r.richTextField, text);
    expect(onChange).toHaveBeenCalledWith(text, text, []);
    expect(r.richTextField).toHaveValue(text);
  });
});
