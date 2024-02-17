import { TextFieldBase } from "src/inputs/TextFieldBase";
import { render } from "src/utils/rtl";

describe(TextFieldBase, () => {
  it("shows error and helper text", async () => {
    const r = await render(<TextFieldBase inputProps={{}} label="Test" errorMsg="Error" helperText="Helper" />);
    expect(r.test_errorMsg).toHaveTextContent("Error");
    expect(r.test_helperText).toHaveTextContent("Helper");
  });

  it("hides error and helper text when read only", async () => {
    const r = await render(
      <TextFieldBase inputProps={{ readOnly: true }} label="Test" errorMsg="Error" helperText="Helper" />,
    );
    expect(r.test).toHaveAttribute("data-readonly", "true");
    expect(r.query.test_errorMsg).not.toBeInTheDocument();
    expect(r.query.test_helperText).not.toBeInTheDocument();
  });

  it("hides error and helper text when disabled", async () => {
    const r = await render(
      <TextFieldBase inputProps={{ disabled: true }} label="Test" errorMsg="Error" helperText="Helper" />,
    );
    expect(r.test).toBeDisabled();
    expect(r.query.test_errorMsg).not.toBeInTheDocument();
    expect(r.query.test_helperText).not.toBeInTheDocument();
  });
});
