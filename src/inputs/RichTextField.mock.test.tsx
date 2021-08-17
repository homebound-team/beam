import { noop } from "src/utils";
import { render, type } from "src/utils/rtl";
import { RichTextField as MockRichTextField } from "./RichTextField.mock";

describe("MockRichTextField", () => {
  it("fires onChange with text content", async () => {
    const onChange = jest.fn();
    const text = "This is some content";
    const r = await render(<MockRichTextField value={""} onChange={onChange} onBlur={noop} onFocus={noop} />);
    type(r.richTextField, text);
    expect(onChange).toHaveBeenCalledWith(text, text, []);
    expect(r.richTextField()).toHaveValue(text);
  });
});
