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
    it("renders the original struck through beside the input", async () => {
      const r = await render(
        <TextFieldBase inputProps={{ value: "Down" }} label="Test" originalValue="Up" proposedValue="Down" />,
      );
      // The proposal is the input's own value, styled — not a painted copy
      expect(r.test).toHaveValue("Down");
      expect(r.test).toHaveAttribute("data-ai-mode", "true");
      expect(r.test_originalValue).toHaveTextContent("Up");
      expect(r.test_originalValue).toHaveStyle({ textDecoration: "line-through" });
    });

    it("keeps the original visible on focus", async () => {
      // The whole point of it being a sibling rather than an overlay
      const r = await render(
        <TextFieldBase inputProps={{ value: "Down" }} label="Test" originalValue="Up" proposedValue="Down" />,
      );
      focus(r.test);
      expect(r.test_originalValue).toBeInTheDocument();
      expect(r.test).toHaveAttribute("data-ai-mode", "true");
      expect(r.test).not.toHaveStyle({ position: "absolute" });
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
