import React, { useMemo, PropsWithChildren } from "react";

const Context = React.createContext<string>("");
const { Provider } = Context;

interface TestIdProps {
  /** The name of the current component that we'll push onto the id stack. */
  name: string;
}

export function TestId(props: PropsWithChildren<TestIdProps>) {
  const { name, children } = props;
  const namespace = React.useContext(Context);
  return <Provider value={prefixUnlessTopLevel(namespace, name)}>{children}</Provider>;
}

// We support two overloads, the 1st is for TextField-type use case of an passing in an id
export function useTestIds(id: string, names?: string[]): object[];
export function useTestIds(names: string[]): object[];
export function useTestIds(idOrNames: string | string[], maybeRest?: string[]): object[] {
  const namespace = React.useContext(Context);
  return useMemo(() => {
    if (typeof idOrNames === "string") {
      const id = idOrNames as string;
      const names = maybeRest || [];
      const idNamespace = prefixUnlessTopLevel(namespace, id);
      // I.e. if passed `useTestIds("total", ["input"])`, return [totalId, inputId]
      return [literalWithDataTestId(namespace, id), ...names.map((name) => literalWithDataTestId(idNamespace, name))];
    } else {
      const names = idOrNames as string[];
      return names.map((name) => literalWithDataTestId(namespace, name));
    }
  }, [idOrNames, maybeRest, namespace]);
}

function literalWithDataTestId(namespace: string, name: string): object {
  return { "data-testid": prefixUnlessTopLevel(namespace, name) };
}

function prefixUnlessTopLevel(namespace: string, name: string): string {
  return namespace === "" ? name : `${namespace}_${name}`;
}

export function maybeTestId(props: any): string | undefined {
  return props["data-testid"];
}
