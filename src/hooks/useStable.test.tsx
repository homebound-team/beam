import { useMemo } from "react";
import { Stable, useStable } from "src/hooks/useStable";
import { noop } from "src/utils";

describe("useStable", () => {
  describe("list props", () => {
    it("fails on unstable lists", async () => {
      function Test() {
        // Given an unstable prop value
        const unstable = [1, 2, 3];
        // Then it's a compile error
        // @ts-expect-error
        return <TestComponent list={unstable} />;
      }
      noop(<Test />);
    });

    it("works on stable lists", async () => {
      function Test() {
        // Given a stable prop value
        const stable = useStable(() => [1, 2, 3], []);
        // Then it compiles
        return <TestComponent list={stable} />;
      }
      noop(<Test />);
    });

    it("works on memo-d lists", async () => {
      function Test() {
        // Given a memo-d prop value
        const stable = useMemo(() => [1, 2, 3], []);
        // Then it compiles
        return <TestComponent list={stable} />;
      }
      noop(<Test />);
    });
  });

  describe("object props", () => {
    it("fails on unstable objects", async () => {
      function Test() {
        // Given an unstable prop value
        const author = { firstName: "foo" };
        // Then it doesn't compile
        // @ts-expect-error
        return <TestComponent author={author} />;
      }
      noop(<Test />);
    });

    it("works on stable objects", async () => {
      function Test() {
        // Given an stable prop value
        const author = useStable(() => ({ firstName: "foo" }), []);
        // Then it compiles
        return <TestComponent author={author} />;
      }
      noop(<Test />);
    });

    it("works on memo-d objects", async () => {
      function Test() {
        // Given a memo-d prop value
        const author = useMemo(() => ({ firstName: "foo" }), []);
        // Then it compiles
        return <TestComponent author={author} />;
      }
      noop(<Test />);
    });
  });

  describe("list deps", () => {
    it("fails on unstable lists", async () => {
      function Test() {
        // Given an unstable dep
        const unstable = [1, 2, 3];
        // THen useStable throws a compile error
        // @ts-expect-error
        const stable = useStable(() => unstable, [unstable]);
        return <div>{stable}</div>;
      }
      noop(<Test />);
    });

    it("works on stable lists", async () => {
      function Test() {
        // Given a stable dep
        const stable1 = useStable(() => [1, 2, 3], []);
        // Then useStable compiles
        const stable2 = useStable(() => stable1, [stable1]);
        return <div>{stable2}</div>;
      }
      noop(<Test />);
    });

    it("works on memo-d lists", async () => {
      function Test() {
        // Given a memo-d dep
        const stable1 = useMemo(() => [1, 2, 3], []);
        // Then useStable compiles
        const stable2 = useStable(() => stable1, [stable1]);
        return <div>{stable2}</div>;
      }
      noop(<Test />);
    });

    it("ideally fails but does not with useMemo", async () => {
      function Test() {
        // Given an unstable dep
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const unstable = [1, 2, 3];
        // THen useMemo _should_ throws a compile error ... but does eslint error
        const stable = useMemo(() => unstable, [unstable]);
        return <div>{stable}</div>;
      }
      noop(<Test />);
    });
  });
});

type Author = { firstName: string };

function TestComponent(props: { list?: Stable<number[]>; author?: Stable<Author> }) {
  return <div />;
}
