import { ModalBody, ModalHeader } from "src/components/Modal/Modal";
import { ModalFullBleed } from "src/components/Modal/ModalFullBleed";
import { OpenModal } from "src/components/Modal/OpenModal";
import { render } from "src/utils/rtl";

describe("ModalFullBleed", () => {
  it("leaves the child alone outside a modal", async () => {
    // When rendered outside a modal
    const r = await render(
      <ModalFullBleed>
        <div data-testid="fullBleed">Hello World!</div>
      </ModalFullBleed>,
    );
    // Then no bleed is applied
    expect(r.fullBleed.style.marginLeft).toBe("");
  });

  it("cancels ModalBody padding inside a modal", async () => {
    // When rendered inside a modal body
    const r = await render(
      <OpenModal>
        <BleedModal />
      </OpenModal>,
    );
    // Then the child meets the modal edges, keeps the content inset, and is a size container
    expect(r.fullBleed).toHaveStyle({
      marginLeft: "calc(var(--t-spacing) * -3)",
      marginRight: "calc(var(--t-spacing) * -3)",
      paddingLeft: "calc(var(--t-spacing) * 3)",
      paddingRight: "calc(var(--t-spacing) * 3)",
      containerType: "inline-size",
    });
  });

  it("can skip re-applying the body padding", async () => {
    // When rendered with the padding omitted
    const r = await render(
      <OpenModal>
        <BleedModal omitPadding />
      </OpenModal>,
    );
    // Then the child still spans the modal, without the inset
    expect(r.fullBleed).toHaveStyle({
      marginLeft: "calc(var(--t-spacing) * -3)",
      marginRight: "calc(var(--t-spacing) * -3)",
    });
    expect(r.fullBleed.style.paddingLeft).toBe("");
  });
});

function BleedModal({ omitPadding = false }: { omitPadding?: boolean }) {
  return (
    <>
      <ModalHeader>Title</ModalHeader>
      <ModalBody>
        <ModalFullBleed omitPadding={omitPadding}>
          <div data-testid="fullBleed">Hello World!</div>
        </ModalFullBleed>
      </ModalBody>
    </>
  );
}
