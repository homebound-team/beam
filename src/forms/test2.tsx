// Conditionally require the `get` key
export type MaybeGet<O> = O extends { id: string }
  ? //
    { get?: (opt: O) => string }
  : { get: (opt: O) => string };

function TakesMaybeGet<O>(props: MaybeGet<O>) {
  return null;
}

type A = Omit<object, "a">;

function CallsMaybeGet<O>(props: MaybeGet<O> & { extra: string }) {
  // Spreading props into rest fundamentally breaks MaybeGet-ism
  const { extra, ...rest } = props;

  // This works, i.e. if invokes as a regular function and `props` is kept intact
  // return takesMaybeGet(props);

  // This breaks because the spread of props also drops the MaybeGet-ism
  // return <TakesMaybeGet {...props} />;

  // This breaks because the non-JSX spread also drops
  // return TakesMaybeGet(rest);

  // This is really what I want, and is broken because `rest` has lost its MaybeGet-ism
  return <TakesMaybeGet {...rest} />;
}
