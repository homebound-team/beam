import { createObjectState, type ObjectConfig, type ObjectState, required } from "@homebound/form-state";
import { render } from "@homebound/rtl-utils";
import { fireEvent } from "@testing-library/react";
import { BoundTextField } from "src/forms/BoundTextField";
import type { AuthorInput } from "src/forms/formStateDomain";
import { type } from "src/utils/rtl";
import { vi } from "vitest";

describe("BoundTextField", () => {
  it("shows the current value", async () => {
    const author = createObjectState(formConfig, { firstName: "bob" });
    const r = await render(<BoundTextField field={author.firstName} />);
    expect(r.firstName).toHaveValue("bob");
  });

  it("shows an error message", async () => {
    const author = createObjectState(formConfig, {});
    author.touched = true;
    const r = await render(<BoundTextField field={author.firstName} />);
    expect(r.firstName_errorMsg).toHaveTextContent("Required");
  });

  it("can blur onEnter and call onEnter callback", async () => {
    const autoSave = vi.fn();
    const onEnter = vi.fn();
    const author: ObjectState<AuthorInput> = createObjectState(
      formConfig,
      {},
      { maybeAutoSave: () => autoSave(author.firstName.value) },
    );
    // Given a textfield
    const r = await render(<BoundTextField field={author.firstName} onEnter={onEnter} />);
    // When entering a name
    type(r.firstName, "Brandon");
    // And hitting the Enter key
    fireEvent.keyDown(r.firstName, { key: "Enter" });
    // Then onEnter should be called
    expect(onEnter).toHaveBeenCalledTimes(1);
    // And the Field State's autoSave should have been called.
    expect(autoSave).toHaveBeenCalledWith("Brandon");
  });

  it("scopes label help to the field key rather than its display label", async () => {
    // Given a bound field whose display label differs from its key
    const author = createObjectState(formConfig, {});
    // When rendered with label help
    const r = await render(<BoundTextField field={author.firstName} label="Given Name" tooltip="Legal first name" />);
    // Then the tooltip uses the bound field's resolved prefix
    expect(r.firstName_label_tooltip).toHaveAttribute("title", "Legal first name");
  });

  it("scopes a hidden-label disabled reason to an explicit test id", async () => {
    // Given a bound field with a disabled reason and a normal tooltip
    const author = createObjectState(formConfig, {});
    // When rendered without a visible label and with an explicit prefix
    const r = await render(
      <BoundTextField
        field={author.firstName}
        data-testid="legalName"
        labelStyle="hidden"
        disabled="Archived"
        tooltip="Legal first name"
      />,
    );
    // Then the scoped field tooltip shows the disabled reason
    expect(r.legalName_tooltip).toHaveAttribute("title", "Archived");
  });

  it("scopes an inline-label read-only reason to the field key", async () => {
    // Given a bound field with a read-only reason
    const author = createObjectState(formConfig, {});
    // When rendered with an inline label
    const r = await render(<BoundTextField field={author.firstName} labelStyle="inline" readOnly="Managed by HR" />);
    // Then the scoped field tooltip shows the read-only reason
    expect(r.firstName_tooltip).toHaveAttribute("title", "Managed by HR");
  });
});

const formConfig: ObjectConfig<AuthorInput> = {
  firstName: { type: "value", rules: [required] },
};
