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
    it("renders the original struck through below the field", async () => {
      const r = await render(
        <TextFieldBase inputProps={{ value: "Down" }} label="Test" originalValue="Up" proposedValue="Down" />,
      );
      // The proposal is the input's own value, styled — not a painted copy
      expect(r.test).toHaveValue("Down");
      expect(r.test).toHaveAttribute("data-ai-mode", "true");
      expect(r.test_originalValue).toHaveTextContent("Up");
      expect(r.test_originalValue).toHaveStyle({ textDecoration: "line-through" });
      // Below the field, not inside it, so a long original can't crowd out the proposal
      expect(r.test.parentElement).not.toContainElement(r.test_originalValue);
    });

    it("keeps the original visible on focus", async () => {
      // It stays put while the user types over the proposal, so it remains a reference
      const r = await render(
        <TextFieldBase inputProps={{ value: "Down" }} label="Test" originalValue="Up" proposedValue="Down" />,
      );
      focus(r.test);
      expect(r.test_originalValue).toBeInTheDocument();
      expect(r.test).toHaveAttribute("data-ai-mode", "true");
    });

    it("stacks the original above the error and helper text", async () => {
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Down" }}
          label="Test"
          originalValue="Up"
          proposedValue="Down"
          errorMsg="Error"
          helperText="Helper"
        />,
      );
      // Reading down the field: label, original, error, helper
      expect(r.test_originalValue.parentElement).toHaveTextContent(/Test.*Up.*Error.*Helper/);
    });

    it("renders the original outside the row when the label is to the left", async () => {
      // That layout puts the label and field in a flex row, so the original has to render after it
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Down" }}
          label="Test"
          originalValue="Up"
          proposedValue="Down"
          labelStyle="left"
        />,
      );
      const labelAndFieldRow = r.test.parentElement!.parentElement!;
      expect(labelAndFieldRow).not.toContainElement(r.test_originalValue);
      expect(r.test_originalValue).toHaveTextContent("Up");
    });

    it("shows the original when disabled", async () => {
      // Unlike helper text, which is noise on a field nobody can edit, the original is what's being replaced
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Down", disabled: true }}
          label="Test"
          originalValue="Up"
          proposedValue="Down"
          helperText="Helper"
        />,
      );
      expect(r.test_originalValue).toHaveTextContent("Up");
      expect(r.query.test_helperText).not.toBeInTheDocument();
    });

    it("shows the original when disabled and the label is to the left", async () => {
      // "left" keeps the original and the helper text in one block, so they can still part ways
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Down", disabled: true }}
          label="Test"
          originalValue="Up"
          proposedValue="Down"
          helperText="Helper"
          labelStyle="left"
        />,
      );
      expect(r.test_originalValue).toHaveTextContent("Up");
      expect(r.query.test_helperText).not.toBeInTheDocument();
    });

    it("omits the original when the field had no prior value", async () => {
      const r = await render(
        <TextFieldBase inputProps={{ value: "Janes Cottage" }} label="Test" proposedValue="Janes Cottage" />,
      );
      expect(r.test).toHaveAttribute("data-ai-mode", "true");
      expect(r.query.test_originalValue).not.toBeInTheDocument();
    });

    it("leaves a caller-provided unfocusedPlaceholder alone", async () => {
      // AI mode no longer hijacks the slot, so MultiSelect keeps rendering its chips
      const r = await render(
        <TextFieldBase
          inputProps={{ value: "Blue" }}
          label="Test"
          unfocusedPlaceholder={"chips go here"}
          originalValue="Green"
          proposedValue="Blue"
        />,
      );
      expect(r.test_unfocusedPlaceholderContainer).toHaveTextContent("chips go here");
      expect(r.test_originalValue).toHaveTextContent("Green");
    });

    it("shows both halves as text when readOnly", async () => {
      // readOnly renders no input at all, so it takes a separate path
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

    it("renders the original independently of the proposal", async () => {
      // After the user types, the proposal styling is gone but the original stays as a reference
      const r = await render(<TextFieldBase inputProps={{ value: "Sideways" }} label="Test" originalValue="Up" />);
      expect(r.test).not.toHaveAttribute("data-ai-mode");
      expect(r.test_originalValue).toHaveTextContent("Up");
    });

    it("stays a normal field when there is neither", async () => {
      const r = await render(<TextFieldBase inputProps={{ value: "Up" }} label="Test" />);
      expect(r.test).not.toHaveAttribute("data-ai-mode");
      expect(r.query.test_originalValue).not.toBeInTheDocument();
    });
  });
});
