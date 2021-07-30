import { useMemo } from "react";

export const stable = Symbol("stable");

type Stable<T> = T & { [stable]: true };

interface TableProps {
  columns: Stable<string[]>;
  // columns: string[];
}

function Table(props: TableProps) {
  const { columns } = props;
  const data = useMemo(() => {
    return columns;
  }, [columns]);
  return <div>foo</div>;
}

const depA = markStable({ a: "a" });

function Page(props: {}) {
  // const query = usePageQuery(...); // Stable<..Query>
  const columns = useMemo(() => ["a", "b"], [depA]);
  // const columns = ["a", "b"];
  return <Table columns={markStable(["a", "b"])} />;
}

function markStable<T>(obj: T): Stable<T> {
  return obj as any;
}

type DependencyList2 = ReadonlyArray<Stable<unknown>>;
declare module "react" {
  function useMemo<T>(factory: () => T, deps: DependencyList2 | undefined): Stable<T>;
}

type SingleProps<O, V> = { options: O[]; value: V; onChange: (value: V) => void };

type FilterDef<V> = ({ kind: "single" } & SingleProps<any, V>) | { kind: "bar" };

function newFilter(defs: { billId: FilterDef<number>; userId: FilterDef<string> }) {}

function single<O, V>(props: SingleProps<O, V>): { kind: "single" } & SingleProps<O, V> {
  return { kind: "single" as const, ...props };
}

newFilter({
  billId: single({
    options: ["asdf", "asdf"],
    value: 1,
    // value is a number here
    onChange: (value) => {},
  }),
  userId: single({
    options: ["asdf", "asdf"],
    value: "asdf",
    // value is a string here
    onChange: (value) => {},
  }),
});
