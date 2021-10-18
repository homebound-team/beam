import { PresentationProvider, usePresentationContext } from "src/components/PresentationContext";
import { render } from "src/utils/rtl";

describe("PresentationContext", () => {
  it("correctly sets 'baseContext' when not nested", async () => {
    const r = await render(
      <PresentationProvider>
        <TestComponent />
      </PresentationProvider>,
      { omitBeamContext: true },
    );
    expect(r.baseContext().textContent).toBe("true");
  });

  it("correctly sets 'baseContext' when nested", async () => {
    const r = await render(
      <PresentationProvider>
        <PresentationProvider>
          <TestComponent />
        </PresentationProvider>
      </PresentationProvider>,
      { omitBeamContext: true },
    );
    expect(r.baseContext().textContent).toBe("false");
  });

  it("overrides only newly set values", async () => {
    // Given nested PresentationProviders that overwrites some values
    const r = await render(
      <PresentationProvider
        hideLabel
        formLabelSuffix={{ required: "*" }}
        numberAlignment="right"
        gridTableStyle={{ emptyCell: "Test" }}
      >
        <PresentationProvider hideLabel={false} formLabelSuffix={{ required: "?" }}>
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
      <PresentationProvider numberAlignment="right">
        <PresentationProvider numberAlignment={undefined}>
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
  const { baseContext, hideLabel, formLabelSuffix, numberAlignment, gridTableStyle } = usePresentationContext();
  return (
    <>
      <div data-testid="baseContext">{JSON.stringify(baseContext)}</div>
      <div data-testid="hideLabel">{JSON.stringify(hideLabel)}</div>
      <div data-testid="formLabelSuffix">{JSON.stringify(formLabelSuffix)}</div>
      <div data-testid="numberAlignment">{JSON.stringify(numberAlignment)}</div>
      <div data-testid="gridTableStyle">{JSON.stringify(gridTableStyle)}</div>
    </>
  );
}
