export function defaultOptionValue<O, V>(opt: O): V {
  return (opt as any).id;
}

export function defaultOptionLabel<O>(opt: O): string {
  return (opt as any).name;
}
