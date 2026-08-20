import { useCallback, useRef, useState } from "react";
import type { TextFieldBaseProps } from "src/inputs/TextFieldBase";

/** The display half of AI mode, ready to spread onto `TextFieldBase`. */
export type AiProposalProps = Pick<
  TextFieldBaseProps<any>,
  "proposedValue" | "originalValue" | "onUserEdit" | "onUserBlur"
>;

export type UseAiProposalResult<V> = {
  /** The value the field should render and edit — the proposal until the user types. */
  effectiveValue: V | undefined;
  /** The props `TextFieldBase` needs, already gated on where the user is in reviewing the proposal. */
  proposalProps: AiProposalProps;
};

/**
 * Drives a field's "AI mode": the proposal becomes the field's effective value — displayed and handed
 * to its input — while the on-record value is rendered struck through beside it.
 *
 * The two halves end at different times, on purpose. The AI styling drops as soon as the user types,
 * so they see their own text normally, but the struck original stays until they leave the field so it
 * remains a reference while they edit over the proposal.
 *
 * Both are driven by events rather than by watching `value`, because a user rejecting a proposal by
 * re-entering the on-record value produces no change to `value` at all — there is nothing to observe.
 */
export function useAiProposal<V>(
  value: V | undefined,
  proposedValue: V | undefined,
  /** Turns a `V` into display text; fields whose value isn't already a string pass their own. */
  format: (value: V) => string | undefined = String,
): UseAiProposalResult<V> {
  // Pinned, because it stays on screen while the user types over the proposal — reading `value` would
  // strike through their own in-progress edit.
  const originalValue = useRef(value);
  const [hasTyped, setHasTyped] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const onUserEdit = useCallback(() => setHasTyped(true), []);
  // Leaving the field after an edit is what retires the original; a bare tab-through leaves it alone.
  const onUserBlur = useCallback(() => setIsReviewed((wasReviewed) => wasReviewed || hasTyped), [hasTyped]);

  const hasProposal = proposedValue !== undefined;
  const isAiMode = hasProposal && !hasTyped;

  return {
    effectiveValue: isAiMode ? proposedValue : value,
    proposalProps: {
      proposedValue: isAiMode ? format(proposedValue as V) : undefined,
      originalValue:
        hasProposal && !isReviewed && originalValue.current !== undefined ? format(originalValue.current) : undefined,
      onUserEdit,
      onUserBlur,
    },
  };
}
