import { HeaderActions } from "src/components/Headers/HeaderActions";
import { render } from "src/utils/rtl";

describe("HeaderActions", () => {
  it("renders actions as Buttons / IconButtons", async () => {
    // Given a HeaderActions with a default action and an icon action
    const r = await render(
      <HeaderActions
        actions={[
          { label: "Add", onClick: () => {} },
          { kind: "icon", icon: "refresh", label: "Refresh", onClick: () => {} },
        ]}
      />,
    );
    // Then both render as real Buttons / IconButtons
    expect(r.add).toBeInTheDocument();
    expect(r.refresh).toBeInTheDocument();
  });
});
