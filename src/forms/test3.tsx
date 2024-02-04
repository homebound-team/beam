type EitherKey<O> = O extends object ? { a: string } : { b: number };

function getKey<O>(opts: EitherKey<O>) {
  return null;
}

function getKey2<O>(opts: EitherKey<O> & { foo: string }) {
  const { foo, ...rest } = opts;
  return getKey<O>(rest);
}
