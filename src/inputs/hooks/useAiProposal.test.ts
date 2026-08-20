import { act, renderHook } from "@testing-library/react";
import { useAiProposal } from "src/inputs/hooks/useAiProposal";

describe("useAiProposal", () => {
  it("is off when there is no proposal", async () => {
    const { result } = renderHook(() => useAiProposal("up", undefined));
    expect(result.current.effectiveValue).toBe("up");
    expect(result.current.proposalProps.proposedValue).toBeUndefined();
    expect(result.current.proposalProps.originalValue).toBeUndefined();
  });

  it("makes the proposal the effective value and shows both halves", async () => {
    const { result } = renderHook(() => useAiProposal("up", "down"));
    expect(result.current.effectiveValue).toBe("down");
    expect(result.current.proposalProps).toMatchObject({ proposedValue: "down", originalValue: "up" });
  });

  it("omits the original when there was no prior value", async () => {
    const { result } = renderHook(() => useAiProposal(undefined, "Janes Cottage"));
    expect(result.current.proposalProps).toMatchObject({ proposedValue: "Janes Cottage" });
    expect(result.current.proposalProps.originalValue).toBeUndefined();
  });

  it("formats both halves with the caller's formatter", async () => {
    const { result } = renderHook(() => useAiProposal(20, 25, (v) => `$${v}`));
    expect(result.current.proposalProps).toMatchObject({ proposedValue: "$25", originalValue: "$20" });
  });

  it("drops the AI styling on the first edit but keeps the original", async () => {
    const { result } = renderHook(() => useAiProposal("up", "down"));
    act(() => result.current.proposalProps.onUserEdit!());
    // Styling is gone, so the field reads as normal while they type...
    expect(result.current.proposalProps.proposedValue).toBeUndefined();
    expect(result.current.effectiveValue).toBe("up");
    // ...but the original stays as a reference until they leave the field
    expect(result.current.proposalProps.originalValue).toBe("up");
  });

  it("retires the original on blur after an edit", async () => {
    const { result } = renderHook(() => useAiProposal("up", "down"));
    act(() => result.current.proposalProps.onUserEdit!());
    act(() => result.current.proposalProps.onUserBlur!());
    expect(result.current.proposalProps.originalValue).toBeUndefined();
  });

  it("keeps both halves when the user blurs without editing", async () => {
    // Tabbing through a form to review it shouldn't retire anything
    const { result } = renderHook(() => useAiProposal("up", "down"));
    act(() => result.current.proposalProps.onUserBlur!());
    expect(result.current.proposalProps).toMatchObject({ proposedValue: "down", originalValue: "up" });
    expect(result.current.effectiveValue).toBe("down");
  });

  it("ends AI mode even when the value never changes", async () => {
    // Rejecting a proposal by re-entering the on-record value leaves `value` untouched, so only the
    // edit event can tell us anything happened.
    const { result, rerender } = renderHook(({ value }) => useAiProposal(value, "down"), {
      initialProps: { value: "up" as string | undefined },
    });
    act(() => result.current.proposalProps.onUserEdit!());
    rerender({ value: "up" });
    expect(result.current.proposalProps.proposedValue).toBeUndefined();
    expect(result.current.effectiveValue).toBe("up");
  });

  it("pins the original, so typing over the proposal doesn't restrike the user's own text", async () => {
    const { result, rerender } = renderHook(({ value }) => useAiProposal(value, "down"), {
      initialProps: { value: "up" as string | undefined },
    });
    act(() => result.current.proposalProps.onUserEdit!());
    rerender({ value: "sideways" });
    expect(result.current.proposalProps.originalValue).toBe("up");
  });

  it("stays off once edited, even if the value later lands on the proposal", async () => {
    const { result, rerender } = renderHook(({ value }) => useAiProposal(value, "down"), {
      initialProps: { value: "up" as string | undefined },
    });
    act(() => result.current.proposalProps.onUserEdit!());
    rerender({ value: "down" });
    expect(result.current.proposalProps.proposedValue).toBeUndefined();
  });
});
