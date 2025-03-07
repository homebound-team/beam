import { ComponentType } from "react";

// HOC that conditionally swaps components
export function withTestMock<P extends object>(Component: ComponentType<P>, MockComponent: ComponentType<P>) {
  return (props: P) => {
    const isTest = process.env.NODE_ENV === "test";
    const SelectedComponent = isTest ? MockComponent : Component;
    return <SelectedComponent {...props} />;
  };
}
