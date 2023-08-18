import { act } from "@testing-library/react";
import { observable } from "mobx";
import { useState } from "react";
import { useComputed } from "src/hooks/useComputed";
import { objectId } from "src/utils/objectId";
import { click, render } from "src/utils/rtl";

let renderedCount = 0;
let evaledCount = 0;

describe("useComputed", () => {
  beforeEach(() => {
    renderedCount = 0;
    evaledCount = 0;
  });

  it("only renders once", async () => {
    const someProxy = observable({ name: "foo" });
    await render(<TestComponent someProxy={someProxy} />);
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(1);
  });

  it("re-renders on proxy change", async () => {
    const someProxy = observable({ name: "foo" });
    const { name } = await render(<TestComponent someProxy={someProxy} />);
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(1);
    expect(name()).toHaveTextContent("foo");

    act(() => {
      someProxy.name = "bar";
    });
    expect(renderedCount).toEqual(2);
    expect(evaledCount).toEqual(2);
    expect(name()).toHaveTextContent("bar");
  });

  it("does not re-renders on proxy change that doesn't change return value", async () => {
    const someProxy = observable({ name: "foo" });
    const { name } = await render(<TestComponent someProxy={someProxy} computedFn={(p) => p.name.substring(0, 1)} />);
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(1);
    expect(name()).toHaveTextContent("f");

    act(() => {
      someProxy.name = "food";
    });
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(2);
    expect(name()).toHaveTextContent("f");
  });

  it("does not re-renders on proxy change that doesn't deeply change return value", async () => {
    // Given an observable
    const someProxy = observable({ name: "foo" });
    // And a useComputed that returns an array
    await render(<TestComponent someProxy={someProxy} computedFn={(p) => [p.name.charAt(0), p.name.charAt(1)]} />);
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(1);
    // When the proxy changes
    act(() => {
      someProxy.name = "food";
    });
    // Then we re-evaled the value
    expect(evaledCount).toEqual(2);
    // But didn't re-render b/c it was not deeply different
    expect(renderedCount).toEqual(1);
  });

  it("keeps a stable return value if shallow equal", async () => {
    const obs = observable({ name: "foo" });
    const objectIds: number[] = [];
    function TestComponent() {
      // Given a use computed that returns a shallow equal array each time
      const chars = useComputed(() => [obs.name.charAt(0), obs.name.charAt(1)], [obs]);
      objectIds.push(objectId(chars));
      return <div>{chars}</div>;
    }
    const r = await render(<TestComponent />);
    // When the proxy changes, but the return value is shallow equal, we don't even re-render
    act(() => {
      obs.name = "food";
    });
    expect(objectIds).toEqual([1]);
    // And when the component re-renders organically
    r.rerender(<TestComponent />);
    // We've kept the same object id
    expect(objectIds).toEqual([1, 1]);
  });

  it("re-renders on other hook change", async () => {
    const someProxy = observable({ name: "foo" });
    const { name, color, makeBlue } = await render(<TestComponent someProxy={someProxy} />);
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(1);
    expect(name()).toHaveTextContent("foo");
    expect(color()).toHaveTextContent("red");

    click(makeBlue);
    expect(renderedCount).toEqual(2);
    expect(evaledCount).toEqual(1);
    expect(name()).toHaveTextContent("foo");
    expect(color()).toHaveTextContent("blue");
  });

  it("re-renders on deps change", async () => {
    const someProxy = observable({ name: "foo" });
    const { name, changeDep } = await render(<TestComponent someProxy={someProxy} />);
    expect(renderedCount).toEqual(1);
    expect(evaledCount).toEqual(1);
    expect(name()).toHaveTextContent("foo-dep1");

    act(() => {
      someProxy.name = "bar";
    });
    expect(renderedCount).toEqual(2);
    expect(evaledCount).toEqual(2);
    expect(name()).toHaveTextContent("bar-dep1");

    click(changeDep);
    expect(renderedCount).toEqual(3);
    expect(evaledCount).toEqual(3);
    expect(name()).toHaveTextContent("bar-dep2");
  });
});

type SomeProxy = { name: string };

interface TestComponentProps {
  someProxy: SomeProxy;
  computedFn?: (o: SomeProxy, dep: string) => any;
}

function TestComponent(props: TestComponentProps) {
  const { someProxy, computedFn } = props;
  const [dep, setDep] = useState("dep1");
  // Add another hook to trigger non-proxy-driven re-renders
  const [color, setColor] = useState("red");
  const name = useComputed(() => {
    evaledCount++;
    return computedFn ? computedFn(someProxy, dep) : `${someProxy.name}-${dep}`;
  }, [dep]);
  renderedCount++;
  return (
    <div>
      <div data-testid="name">{typeof name === "string" ? name : "any"}</div>
      <div data-testid="color">{color}</div>
      <button data-testid="makeBlue" onClick={() => setColor("blue")}>
        makeBlue
      </button>
      <button data-testid="changeDep" onClick={() => setDep("dep2")}>
        changeDep
      </button>
    </div>
  );
}
