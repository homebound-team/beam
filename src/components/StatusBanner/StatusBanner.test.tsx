import { StatusBanner } from "src/components/StatusBanner/StatusBanner";
import { click, render } from "src/utils/rtl";
import { vi } from "vitest";

describe("StatusBanner", () => {
  it("renders the title and description", async () => {
    // Given a banner with a title and a rich description
    // When rendered
    const r = await render(
      <StatusBanner
        type="update"
        title="Updated Costs Ready"
        description={
          <>
            Updated calculations are ready for <b>632</b> configurations.
          </>
        }
      />,
    );

    // Then both lines render
    expect(r.banner_title).toHaveTextContent("Updated Costs Ready");
    expect(r.banner_description).toHaveTextContent("Updated calculations are ready for 632 configurations.");
  });

  it("omits the description when it has none", async () => {
    // Given a title-only banner
    // When rendered
    const r = await render(<StatusBanner type="info" title="Heads up" />);

    // Then there is no description line
    expect(r.query.banner_description).toBeNull();
  });

  it("uses the type's default icon unless one is passed", async () => {
    // Given a warning banner with and without an icon override
    // When rendered
    const r = await render(
      <>
        <StatusBanner type="warning" title="Default icon" />
        <StatusBanner type="warning" title="Custom icon" icon="finances" />
      </>,
    );

    // Then the default comes from the type and the override replaces it
    expect(r.banner_icon_0).toHaveAttribute("data-icon", "error");
    expect(r.banner_icon_1).toHaveAttribute("data-icon", "finances");
  });

  it("fires each action", async () => {
    // Given a banner with both actions
    const onUpdate = vi.fn();
    const onView = vi.fn();
    const r = await render(
      <StatusBanner
        type="update"
        title="Updated Costs Ready"
        primaryAction={{ label: "Update Costs", onClick: onUpdate }}
        secondaryAction={{ label: "View Details", onClick: onView }}
      />,
    );

    // When clicking each action
    click(r.updateCosts);
    click(r.viewDetails);

    // Then each handler fires once
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("starts closed when it has items", async () => {
    // Given a banner with detail rows
    // When rendered
    const r = await render(
      <StatusBanner
        type="warning"
        title="Options Missing From Bid Package"
        description="The options listed below contain scope for this cost code."
        items={[{ title: "Add Electric Fireplace" }, { title: "Convert Loft to Bedroom" }]}
      />,
    );

    // Then the header shows and the rows stay hidden
    expect(r.banner_title).toHaveTextContent("Options Missing From Bid Package");
    expect(r.banner_toggle).toHaveAttribute("aria-expanded", "false");
    expect(r.banner_details).toHaveAttribute("aria-hidden", "true");
  });

  it("opens its items and fires a row action", async () => {
    // Given a closed banner whose rows have actions
    const onAdd = vi.fn();
    const r = await render(
      <StatusBanner
        type="warning"
        title="Options Missing From Bid Package"
        items={[
          { title: "Add Electric Fireplace", actions: [{ label: "Add to Bid", onClick: onAdd }] },
          { title: "Extended Lanai", description: "Scope detected in Plan 1" },
        ]}
      />,
    );

    // When opening it and clicking the first row's action
    click(r.banner_toggle);
    click(r.addToBid);

    // Then both rows render and the action fires
    expect(r.banner_toggle).toHaveAttribute("aria-expanded", "true");
    expect(r.banner_item_title_0).toHaveTextContent("Add Electric Fireplace");
    expect(r.banner_item_description).toHaveTextContent("Scope detected in Plan 1");
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("closes its items from the chevron", async () => {
    // Given a banner that starts open
    const r = await render(
      <StatusBanner
        type="error"
        title="2 Missing Costs"
        items={[{ title: "Add Electric Fireplace" }, { title: "Convert Loft to Bedroom" }]}
        defaultExpanded
      />,
    );
    expect(r.banner_details).toHaveAttribute("aria-hidden", "false");

    // When toggling it
    click(r.banner_toggle);

    // Then the rows are hidden
    expect(r.banner_details).toHaveAttribute("aria-hidden", "true");
  });
});
