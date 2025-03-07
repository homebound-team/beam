import { ComponentType } from "react";

let useMock = process.env.NODE_ENV === "test";

/**
 * Toggles our mock DateField/RichTextField components.
 *
 * This defaults to true in test suites, but can be disabled if you
 * _really_ want to test against the real component.
 */
export function setUseMockComponents(value: boolean) {
  useMock = value;
}

// HOC that conditionally swaps components
export function withTestMock<P extends object>(Component: ComponentType<P>, MockComponent: ComponentType<P>) {
  return (props: P) => {
    const SelectedComponent = useMock ? MockComponent : Component;
    return <SelectedComponent {...props} />;
  };
}
