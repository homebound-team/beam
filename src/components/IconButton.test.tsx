import { IconButton } from "src/components/IconButton";
import { noop } from "src/utils/helpers";
import { click, render, withRouter } from "src/utils/rtl";
import { useTestIds } from "src/utils/useTestIds";
import { vi } from "vitest";

describe("IconButton", () => {
  it("can add tooltips", async () => {
    // Given an icon button whose label supplies the tooltip
    // When rendered
    const r = await render(<IconButton icon="trash" label="Move to trash" onClick={noop} />);
    // Then the tooltip uses the icon-derived prefix, not the label
    expect(r.trash_tooltip).toHaveAttribute("title", "Move to trash");
  });

  it("renders no tooltip when preventTooltip is set", async () => {
    const r = await render(<IconButton icon="trash" label="Move to trash" preventTooltip onClick={noop} />);
    expect(r.query.trash_tooltip).toBeNull();
  });

  it("can have a data-testid", async () => {
    const r = await render(<IconButton icon="trash" data-testid="remove" onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("remove");
  });

  it("defaults data-testid to the icon", async () => {
    const r = await render(<IconButton icon="trash" onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("trash");
  });

  it("can accept prefixed test ids", async () => {
    const testIds = useTestIds({}, "page1");
    const r = await render(<IconButton icon="trash" {...testIds.remove} onClick={noop} />);
    expect(r.firstElement.firstElementChild!.getAttribute("data-testid")).toEqual("page1_remove");
  });

  it("can stay out of the tab order", async () => {
    // Given a button excluded from tab
    const r = await render(<IconButton icon="trash" excludeFromTabOrder aria-expanded={false} onClick={noop} />);
    // Then it is not a tab stop, and still exposes whether it is expanded
    expect(r.trash).toHaveAttribute("tabIndex", "-1");
    expect(r.trash).toHaveAttribute("aria-expanded", "false");
  });

  it("fires onClick method", async () => {
    const onClick = vi.fn();
    const r = await render(<IconButton icon="trash" onClick={onClick} />);
    expect(r.trash.tagName).toBe("BUTTON");
    click(r.trash);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies expected properties when rendering a link with an absolute url", async () => {
    const r = await render(<IconButton icon="trash" onClick="https://www.homebound.com" />, withRouter());
    expect(r.trash.tagName).toBe("A");
    expect(r.trash).toHaveAttribute("href", "https://www.homebound.com");
    expect(r.trash).toHaveAttribute("target", "_blank");
    expect(r.trash).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("applies expected properties when rendering a link with a relative url", async () => {
    const r = await render(<IconButton icon="trash" onClick="/testPath" />, withRouter());
    expect(r.trash.tagName).toBe("A");
    expect(r.trash).toHaveAttribute("href", "/testPath");
    expect(r.trash).not.toHaveAttribute("target");
    expect(r.trash).not.toHaveAttribute("rel");
  });

  it("applies expected properties when rendering a link with a relative url to open in new tab", async () => {
    const r = await render(<IconButton icon="trash" onClick="/testPath" openInNew />, withRouter());
    expect(r.trash.tagName).toBe("A");
    expect(r.trash).toHaveAttribute("href", "/testPath");
    expect(r.trash).toHaveAttribute("target", "_blank");
    expect(r.trash).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("renders a 48px circle by default", async () => {
    // Given a circle IconButton
    const r = await render(<IconButton icon="comment" variant="circle" onClick={noop} />);

    // Then it is 48px
    expect(r.comment).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("renders a 32px circle when compact", async () => {
    // Given a compact circle IconButton
    const r = await render(<IconButton icon="comment" variant="circle" compact onClick={noop} />);

    // Then it is 32px
    expect(r.comment).toHaveStyle({ width: "32px", height: "32px" });
  });

  it("scopes an explicit tooltip to the icon-derived test id", async () => {
    // Given an explicit tooltip with the label fallback suppressed
    // When rendered
    const r = await render(
      <IconButton icon="trash" label="Delete" tooltip="Move to trash" preventTooltip onClick={noop} />,
    );
    // Then the explicit tooltip still uses the resolved icon prefix
    expect(r.trash_tooltip).toHaveAttribute("title", "Move to trash");
  });

  it("scopes a link tooltip to an explicit test id", async () => {
    // Given a link icon button with an explicit test id
    // When rendered with a tooltip
    const r = await render(
      <IconButton icon="trash" data-testid="removeProduct" tooltip="Move to trash" onClick="/products" />,
      withRouter(),
    );
    // Then the tooltip uses the explicit button prefix
    expect(r.removeProduct_tooltip).toHaveAttribute("title", "Move to trash");
  });

  it("scopes the disabled reason to the icon-derived test id", async () => {
    // Given a disabled reason with a normal tooltip and the label fallback suppressed
    // When rendered
    const r = await render(
      <IconButton icon="trash" disabled="Archived" tooltip="Move to trash" preventTooltip onClick={noop} />,
    );
    // Then the scoped tooltip still exposes the disabled reason instead
    expect(r.trash_tooltip).toHaveAttribute("title", "Archived");
  });

  it("scopes a disabled link reason to an explicit test id", async () => {
    // Given a disabled link icon button with an explicit test id
    // When rendered
    const r = await render(
      <IconButton icon="trash" data-testid="removeProduct" disabled="Archived" onClick="/products" />,
      withRouter(),
    );
    // Then the scoped tooltip exposes the disabled reason
    expect(r.removeProduct_tooltip).toHaveAttribute("title", "Archived");
  });
});
