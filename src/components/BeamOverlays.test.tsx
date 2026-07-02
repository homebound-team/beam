import { createContext, useContext, useEffect } from "react";
import { BeamProvider } from "src/components/BeamContext";
import { BeamOverlays } from "src/components/BeamOverlays";
import { useModal } from "src/components/Modal/useModal";
import { render } from "src/utils/rtl";

describe("BeamOverlays", () => {
  it("lets modal content access providers mounted above BeamOverlays", async () => {
    // Given a provider wrapping routes and BeamOverlays
    const TestContext = createContext("missing");

    function ModalContent() {
      const value = useContext(TestContext);
      return <div data-testid="modalContextValue">{value}</div>;
    }

    function TestApp() {
      const { openModal } = useModal();
      useEffect(() => {
        openModal({ content: <ModalContent /> });
      }, [openModal]);
      return null;
    }

    // When opening a modal via BeamOverlays placed below the provider
    const r = await render(
      <BeamProvider>
        <TestContext.Provider value="from-provider">
          <TestApp />
          <BeamOverlays />
        </TestContext.Provider>
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then modal content sees the provider context
    expect(r.modalContextValue).toHaveTextContent("from-provider");
  });

  it("falls back to BeamProvider overlays when BeamOverlays is not mounted", async () => {
    // Given a provider that does not wrap BeamProvider's fallback overlay mount
    const TestContext = createContext("missing");

    function ModalContent() {
      const value = useContext(TestContext);
      return <div data-testid="modalContextValue">{value}</div>;
    }

    function TestApp() {
      const { openModal } = useModal();
      useEffect(() => {
        openModal({ content: <ModalContent /> });
      }, [openModal]);
      return null;
    }

    const r = await render(
      <BeamProvider>
        <TestContext.Provider value="from-provider">
          <TestApp />
        </TestContext.Provider>
      </BeamProvider>,
      { omitBeamContext: true },
    );

    // Then the modal still opens via fallback
    expect(r.modal).toBeTruthy();
    // And it does not inherit providers nested only in children
    expect(r.modalContextValue).toHaveTextContent("missing");
  });
});
