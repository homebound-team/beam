import { ContextTag, type ContextTagProps } from "src/components/ContextTag";
import { Tag, type TagProps } from "src/components/Tag";

/** A `ContextTag` by default, or a status `Tag` with `kind: "status"`. */
export type ContextOrStatusTagProps =
  ({ kind?: "context" } & ContextTagProps) | ({ kind: "status" } & TagProps<undefined>);

export function ContextOrStatusTag(props: ContextOrStatusTagProps) {
  return props.kind === "status" ? <Tag {...props} /> : <ContextTag {...props} />;
}
