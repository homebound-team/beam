import { click, render } from "src/utils/rtl";
import { ButtonModal } from "./ButtonModal";

describe("ButtonModal", () => {
  it("can open a ButtonModal", async () => {
    // Given a ButtonModal
    const r = await render(
      <ButtonModal trigger={{ label: "Menu trigger" }} content={"Lorum Ipsum"} title={"Modal Title"} />,
    );
    // When opening the ButtonModal
    click(r.menuTrigger);
    // Then expect Button Modal title and content to be rendered
    expect(r.popup_title).toBeTruthy();
    expect(r.popup_content).toBeTruthy();
  });

  it("can be closed via the close prop to contextual modal", async () => {
    // Given the ButtonModal where the content prop is a function that accepts the `close` property and passes it to the resulting component
    function TestModal({ close }: { close: () => void }) {
      return <button onClick={close} data-testid="close" />;
    }
    const r = await render(
      <ButtonModal trigger={{ label: "Trigger" }} content={(close) => <TestModal close={close} />} />,
    );

    // When opening the modal
    click(r.trigger);
    // And clicking the close button within the modal content
    click(r.close);

    // Then the modal should now be closed.
    expect(r.popup).toNotBeInTheDom();
  });

  it("allows jsx as the button", async () => {
    const r = await render(
      <ButtonModal
        trigger={{ label: <div>Button Modal Trigger</div> }}
        content={(close) => <div onClick={close}>close</div>}
      />,
    );

    expect(r.container).toHaveTextContent("Button Modal Trigger");
  });
});
