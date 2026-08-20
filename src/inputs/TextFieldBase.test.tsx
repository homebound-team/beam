import { TextFieldBase } from "src/inputs/TextFieldBase";
import { focus, render } from "src/utils/rtl";

describe("TextFieldBase", () => {
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

  it("handles unfocusedPlaceholder correctly", async () => {
    // When TextFieldBase is first rendered
    const r = await render(
      <TextFieldBase
        inputProps={{}}
        unfocusedPlaceholder={"Unfocused placeholder text"}
        label="Test"
        errorMsg="Error"
        helperText="Helper"
      />,
    );

    // The unfocused placeholder container is rendered
    expect(r.test_unfocusedPlaceholderContainer).toBeInTheDocument();
    // And is visible
    expect(r.test_unfocusedPlaceholderContainer).not.toHaveStyle({ position: "absolute" });

    // And when we focus the field
    focus(r.test);

    // Then the unfocused placeholder container is visually hidden
    expect(r.test_unfocusedPlaceholderContainer).toHaveStyle({ position: "absolute" });
  });

  describe("AI mode", () => {
    it("shows the original struck-through next to the proposal", async () => {
      const r = await render(
        <TextFieldBase inputProps={{ value: "Down" }} label="Test" originalValue="Up" proposedValue="Down" />,
      );
      expect(r.test_proposedValue).toHaveTextContent("Up Down");
      expect(r.test_proposedValue_original).toHaveTextContent("Up");
      expect(r.test_proposedValue_original).toHaveStyle({ textDecoration: "line-through" });
    });

    it("omits the original when the field had no prior value", async () => {
      const r = await render(
        <TextFieldBase inputProps={{ value: "Janes Cottage" }} label="Test" proposedValue="Janes Cottage" />,
      );
      expect(r.test_proposedValue).toHaveTextContent("Janes Cottage");
      expect(r.query.test_proposedValue_original).not.toBeInTheDocument();
    });

    it("reveals the input holding the proposal on focus", async () => {
      const r = await render(
        <TextFieldBase inputProps={{ value: "Down" }} label="Test" originalValue="Up" proposedValue="Down" />,
      );
      // Given the proposal is shown as an overlay, with the input hidden behind it
      expect(r.test_unfocusedPlaceholderContainer).not.toHaveStyle({ position: "absolute" });
      expect(r.test).toHaveStyle({ position: "absolute" });

      // When we focus the field
      focus(r.test);

      // Then the overlay hides and the input, holding the proposal, is editable
      expect(r.test_unfocusedPlaceholderContainer).toHaveStyle({ position: "absolute" });
      expect(r.test).not.toHaveStyle({ position: "absolute" });
      expect(r.test).toHaveValue("Down");
    });

    it("replaces a caller-provided unfocusedPlaceholder", async () => {
      // I.e. MultiSelect's chips, which don't read well struck-through
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Blue" }}
          label="Test"
          unfocusedPlaceholder={"chips go here"}
          originalValue="Green"
          proposedValue="Blue"
        />,
      );
      expect(r.test_unfocusedPlaceholderContainer).not.toHaveTextContent("chips go here");
      expect(r.test_proposedValue).toHaveTextContent("Green Blue");
    });

    it("shows the proposal when readOnly", async () => {
      // readOnly fields don't render an input at all, so they take a separate path
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Down", readOnly: true }}
          label="Test"
          originalValue="Up"
          proposedValue="Down"
        />,
      );
      expect(r.test).toHaveAttribute("data-readonly", "true");
      expect(r.test_proposedValue).toHaveTextContent("Up Down");
    });

    it("stays a normal field when there is no proposal", async () => {
      const r = await render(<TextFieldBase inputProps={{ value: "Up" }} label="Test" originalValue="Up" />);
      expect(r.query.test_proposedValue).not.toBeInTheDocument();
      expect(r.query.test_unfocusedPlaceholderContainer).not.toBeInTheDocument();
    });
  });
});
