import { SnackbarNotice } from "src/components/Snackbar/SnackbarNotice";
import { noop } from "src/utils";
import { click, render } from "src/utils/rtl";

describe("SnackbarNotice", () => {
  it("renders the default snackbar notice layout", async () => {
    const r = await render(<SnackbarNotice id="1" onClose={noop} message="message" />);
    expect(r.query.snackbar_icon).not.toBeInTheDocument();
    expect(r.snackbar_message).toHaveTextContent("message");
    expect(r.query.snackbar_action).not.toBeInTheDocument();
    expect(r.snackbar_close).toBeInTheDocument();
  });

  it("fires onClose callback", async () => {
    const onClose = jest.fn();
    const r = await render(<SnackbarNotice id="1" onClose={onClose} message="message" />);
    click(r.snackbar_close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not hide the close button if notice is persistent", async () => {
    const r = await render(<SnackbarNotice id="1" onClose={noop} message="message" hideCloseButton persistent />);
    expect(r.snackbar_close).toBeInTheDocument();
  });

  it("can hide the close button", async () => {
    const r = await render(<SnackbarNotice id="1" onClose={noop} message="message" hideCloseButton />);
    expect(r.query.snackbar_close).not.toBeInTheDocument();
  });

  it("can render the icon", async () => {
    const r = await render(<SnackbarNotice id="1" onClose={noop} message="message" icon="success" />);
    expect(r.snackbar_icon).toBeInTheDocument();
  });

  it("can render the action and fire the callback", async () => {
    const onClick = jest.fn();
    const r = await render(
      <SnackbarNotice id="1" onClose={noop} message="message" action={{ label: "Action", onClick }} />,
    );
    expect(r.snackbar_action).toHaveTextContent("Action");
    click(r.snackbar_action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
