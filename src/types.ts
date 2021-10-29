export type HasIdAndName<V = string> = { id: V; name: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type Callback = () => void;
export type CheckFn = () => boolean;
export type CanCloseCheck = { check: CheckFn; discardText?: string; continueText?: string } | CheckFn;
export type TypeScale =
  | "tiny"
  | "tinyEm"
  | "xs"
  | "xsEm"
  | "sm"
  | "smEm"
  | "base"
  | "baseEm"
  | "lg"
  | "lgEm"
  | "xl"
  | "xlEm"
  | "xl2"
  | "xl2Em"
  | "xl3"
  | "xl3Em"
  | "xl4"
  | "xl4Em"
  | "xl5"
  | "xl5Em";
