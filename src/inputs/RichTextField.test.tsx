import { render } from "@homebound/rtl-utils";
import { noop } from "src/utils";
import { RichTextField } from "./RichTextField";

describe(RichTextField, () => {
  it("renders", async () => {
    const r = await render(<RichTextField value="<div>test</div>" onChange={noop} />);
    expect(r.getByText("test")).toBeInTheDocument();
  });

  it("rehydrates if data populates", async () => {
    const r = await render(<RichTextField value={""} onChange={noop} />);
    r.rerender(<RichTextField value="<div><!--block-->test</div>" onChange={noop} />);
    expect(r.getByText("test")).toBeInTheDocument();
  });
});
