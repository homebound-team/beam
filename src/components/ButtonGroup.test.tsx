import { ButtonGroup, ButtonGroupButton } from "src/components/ButtonGroup";
import { click, render } from "src/utils/rtl";
import { Css } from "..";

describe("ButtonGroup", () => {
  it("renders and fires callbacks", async () => {
    const firstButtonOnClick = jest.fn();
    const lastButtonOnClick = jest.fn();
    const textButtons: ButtonGroupButton[] = [
      { text: "First", onClick: firstButtonOnClick },
      { text: "Last", onClick: lastButtonOnClick },
    ];
    const r = await render(<ButtonGroup buttons={textButtons} />);
    expect(r.buttonGroup()).toBeTruthy();
    click(r.buttonGroup_first);
    click(r.buttonGroup_last);
    expect(firstButtonOnClick).toBeCalledTimes(1);
    expect(lastButtonOnClick).toBeCalledTimes(1);
  });

  it("sets testids based on icon name", async () => {
    const r = await render(<ButtonGroup buttons={[{ icon: "chevronLeft" }, { icon: "chevronRight" }]} />);
    expect(r.buttonGroup_chevronLeft()).toBeTruthy();
    expect(r.buttonGroup_chevronRight()).toBeTruthy();
  });

  it("can set custom test ids", async () => {
    const r = await render(<ButtonGroup buttons={[{ text: "First" }, { text: "Last" }]} data-testid="actions" />);

    expect(r.actions()).toBeTruthy();
    expect(r.actions_first()).toBeTruthy();
    expect(r.actions_last()).toBeTruthy();
  });

  it("can disable buttons independently", async () => {
    const r = await render(<ButtonGroup buttons={[{ text: "First", disabled: true }, { text: "Last" }]} />);
    expect(r.buttonGroup_first()).toBeDisabled();
    expect(r.buttonGroup_last()).not.toBeDisabled();
  });

  it("can disable all buttons", async () => {
    const r = await render(<ButtonGroup buttons={[{ text: "First" }, { text: "Last" }]} disabled />);
    expect(r.buttonGroup_first()).toBeDisabled();
    expect(r.buttonGroup_last()).toBeDisabled();
  });

  it("can add tooltips", async () => {
    const r = await render(
      <ButtonGroup
        buttons={[
          { text: "First", disabled: "Tooltip" },
          { text: "Last", tooltip: "Other Tooltip" },
        ]}
      />,
    );
    expect(r.buttonGroup_first()).toBeDisabled();
    expect(r.buttonGroup_first().closest("[data-testid='tooltip']")).toHaveAttribute("title", "Tooltip");
    expect(r.buttonGroup_last()).not.toBeDisabled();
    expect(r.buttonGroup_last().closest("[data-testid='tooltip']")).toHaveAttribute("title", "Other Tooltip");
  });

  it("can render jsx", async () => {
    const r = await render(<ButtonGroup buttons={[{ text: <div css={Css.red500.$}>Hello World</div> }]} />);
    expect(r.getByText("Hello World")).toHaveStyleRule("color", Css.red500.$.color);
  });
});
