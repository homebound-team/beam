import { getButtonOrLink } from "src/utils/getInteractiveElement";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("getInteractiveElement", () => {
  const attrs: any = { "data-testid": "button" };
  it("can render as a button and apply onClick", async () => {
    const onClick = vi.fn();
    const r = await render(getButtonOrLink("test", onClick, attrs), {});
    expect(r.button.tagName).toBe("BUTTON");
    click(r.button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(getButtonOrLink("test", "https://www.homebound.com", attrs), {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "https://www.homebound.com");
    expect(r.button).toHaveAttribute("target", "_blank");
    expect(r.button).toHaveAttribute("rel", "noreferrer noopener");
    expect(r.button).not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(getButtonOrLink("test", "/testPath", attrs), {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "/testPath");
    expect(r.button).not.toHaveAttribute("target");
    expect(r.button).not.toHaveAttribute("rel");
    expect(r.button).not.toHaveAttribute("download");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(getButtonOrLink("test", "/testPath", attrs, true), {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "/testPath");
    expect(r.button).toHaveAttribute("target", "_blank");
    expect(r.button).toHaveAttribute("rel", "noreferrer noopener");
    expect(r.button).not.toHaveAttribute("download");
  });

  it("applies expected properties download is true`", async () => {
    const r = await render(getButtonOrLink("test", "/testPath", attrs, false, true), {});
    expect(r.button.tagName).toBe("A");
    expect(r.button).toHaveAttribute("href", "/testPath");
    expect(r.button).toHaveAttribute("download");
    expect(r.button).not.toHaveAttribute("target", "_blank");
    expect(r.button).not.toHaveAttribute("rel", "noreferrer noopener");
  });
});
