import { render } from "@homebound/rtl-utils";
import { act } from "@testing-library/react";
import { noop } from "src/utils";
import { RichTextFieldImpl as RichTextField } from "./RichTextField";

describe("RichTextField", () => {
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

describe("RichTextField controlled value", () => {
  it("does not reload the editor when a stale echo of its own change renders", async () => {
    // Given an editor whose parent stores the html it emits
    const onChange = vi.fn();
    const r = await render(<RichTextField value="" onChange={onChange} />);
    const el = r.container.querySelector("trix-editor") as HTMLElement & {
      editor: { loadHTML: (html: string) => void };
    };
    const loadHTML = vi.spyOn(el.editor, "loadHTML");
    // And trix fires two change events for one keystroke before React commits, as trix 2 does
    act(() => {
      el.innerHTML = "<div><!--block-->Hello </div>";
      el.dispatchEvent(new Event("trix-change"));
      el.innerHTML = "<div><!--block-->Hello @fo</div>";
      el.dispatchEvent(new Event("trix-change"));
    });
    expect(onChange).toHaveBeenCalledTimes(2);
    // When the parent renders with the older of the two emitted values
    r.rerender(<RichTextField value="<div><!--block-->Hello </div>" onChange={onChange} />);
    // Then the editor keeps what the user typed
    expect(loadHTML).not.toHaveBeenCalled();
    expect(el.innerHTML).toBe("<div><!--block-->Hello @fo</div>");
    // And when the parent catches up with the latest value, it is still not reloaded
    r.rerender(<RichTextField value="<div><!--block-->Hello @fo</div>" onChange={onChange} />);
    expect(loadHTML).not.toHaveBeenCalled();
  });

  it("reloads the editor when the parent supplies a genuinely new value", async () => {
    // Given an editor that has emitted a change
    const onChange = vi.fn();
    const r = await render(<RichTextField value="" onChange={onChange} />);
    const el = r.container.querySelector("trix-editor") as HTMLElement & {
      editor: { loadHTML: (html: string) => void };
    };
    const loadHTML = vi.spyOn(el.editor, "loadHTML");
    act(() => {
      el.innerHTML = "<div><!--block-->typed</div>";
      el.dispatchEvent(new Event("trix-change"));
    });
    // When the parent resets the value to html the editor never emitted
    r.rerender(<RichTextField value="<div><!--block-->from server</div>" onChange={onChange} />);
    // Then the editor is reloaded with it
    expect(loadHTML).toHaveBeenCalledWith("<div><!--block-->from server</div>");
    expect(r.getByText("from server")).toBeInTheDocument();
  });
});
