import { act } from "@testing-library/react";
import { observable } from "mobx";
import { useState } from "react";
import { useComputed } from "src/hooks/useComputed";
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
  computedFn?: (o: SomeProxy, dep: string) => string;
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
      <div data-testid="name">{name}</div>
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
