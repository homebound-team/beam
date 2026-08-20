import { useCallback, useState } from "react";

export type UseAiProposalResult<V> = {
  /** Whether the field should render the AI treatment, i.e. the purple box + struck-through original. */
  isAiMode: boolean;
  /** The value the field should render and edit — the proposal while in AI mode. */
  effectiveValue: V | undefined;
  /** Call when the user edits the field; ends AI mode for good. */
  onUserEdit: VoidFunction;
};

/**
 * Drives a field's "AI mode": the proposal becomes the field's effective value — displayed and handed
 * to its input — while `value` is rendered struck-through beside it.
 *
 * AI mode ends on the user's first edit and never comes back, even if they land on the value that was
 * already on record, or later re-enter the proposal. That has to be driven by the edit event rather
 * than by watching `value`: a user rejecting a proposal by retyping the on-record value produces no
 * change to `value` at all, so there is nothing to observe.
 */
export function useAiProposal<V>(value: V | undefined, proposedValue: V | undefined): UseAiProposalResult<V> {
  const [hasEdited, setHasEdited] = useState(false);
  const onUserEdit = useCallback(() => setHasEdited(true), []);
  const isAiMode = proposedValue !== undefined && !hasEdited;
  return { isAiMode, effectiveValue: isAiMode ? proposedValue : value, onUserEdit };
}
