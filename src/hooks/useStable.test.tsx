import { Stable, useStable } from "src/hooks/useStable";
import { noop } from "src/utils";

describe("useStable", () => {
  it("fails on unstable lists", async () => {
    const unstable = [1, 2, 3];
    // @ts-expect-error
    noop(<TestComponent list={unstable} />);
  });

  it("works on stable lists", async () => {
    const stable = useStable(() => [1, 2, 3], []);
    noop(<TestComponent list={stable} />);
  });
});

type Author = { firstName: string };

function TestComponent(props: { list?: Stable<number[]>; author?: Stable<Author> }) {
  return <div />;
}
