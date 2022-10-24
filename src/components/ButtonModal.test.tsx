import { click, render } from "src/utils/rtl";
import { ButtonModal } from "./ButtonModal";

describe("ButtonModal", () => {
  it("can open a ButtonModal", async () => {
    // Given a ButtonModal with a ContextualModal
    const r = await render(<TestButtonModal />);
    // When opening the menu
    click(r.menuTrigger);
    // Then expect Button Modal title and content to be rendered
    expect(r.popup_title).toBeTruthy();
    expect(r.popup_content).toBeTruthy();
  });
});

function TestButtonModal() {
  return (
    <>
      <ButtonModal trigger={{ label: "Menu trigger" }} content={"Lorum Ipsum"} title={"Modal Title"} />
    </>
  );
}
