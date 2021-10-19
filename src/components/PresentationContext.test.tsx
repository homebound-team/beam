import { PresentationProvider, usePresentationContext } from "src/components/PresentationContext";
import { render } from "src/utils/rtl";

describe("PresentationContext", () => {
  it("overrides only newly set values", async () => {
    // Given nested PresentationProviders that overwrites some values
    const r = await render(
      <PresentationProvider
        fieldProps={{ hideLabel: true, labelSuffix: { required: "*" }, numberAlignment: "right" }}
        gridTableStyle={{ emptyCell: "Test" }}
      >
        <PresentationProvider fieldProps={{ hideLabel: false, labelSuffix: { required: "?" } }}>
          <TestComponent />
        </PresentationProvider>
      </PresentationProvider>,
      { omitBeamContext: true },
    );

    // Then overwritten values should be updated
    expect(r.hideLabel().textContent).toBe("false");
    expect(r.formLabelSuffix().textContent).toBe('{"required":"?"}');

    // Existing values should be passed through
    expect(r.numberAlignment().textContent).toBe('"right"');
    expect(r.gridTableStyle().textContent).toBe('{"emptyCell":"Test"}');
  });

  it("can reset value to undefined", async () => {
    // Given nested PresentationProviders that overwrites an existing value to `undefined`
    const r = await render(
      <PresentationProvider fieldProps={{ numberAlignment: "right" }}>
        <PresentationProvider fieldProps={{ numberAlignment: undefined }}>
          <TestComponent />
        </PresentationProvider>
      </PresentationProvider>,
      { omitBeamContext: true },
    );

    // Then value is removed
    expect(r.numberAlignment()).toBeEmptyDOMElement();
  });
});

function TestComponent() {
  const { fieldProps, gridTableStyle } = usePresentationContext();
  return (
    <>
      <div data-testid="hideLabel">{JSON.stringify(fieldProps?.hideLabel)}</div>
      <div data-testid="formLabelSuffix">{JSON.stringify(fieldProps?.labelSuffix)}</div>
      <div data-testid="numberAlignment">{JSON.stringify(fieldProps?.numberAlignment)}</div>
      <div data-testid="gridTableStyle">{JSON.stringify(gridTableStyle)}</div>
    </>
  );
}
