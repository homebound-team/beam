import { act, renderHook } from "@testing-library/react";
import { useAiProposal } from "src/inputs/hooks/useAiProposal";

describe("useAiProposal", () => {
  it("is off when there is no proposal", async () => {
    const { result } = renderHook(() => useAiProposal("up", undefined));
    expect(result.current.isAiMode).toBe(false);
    expect(result.current.effectiveValue).toBe("up");
  });

  it("makes the proposal the effective value", async () => {
    const { result } = renderHook(() => useAiProposal("up", "down"));
    expect(result.current.isAiMode).toBe(true);
    expect(result.current.effectiveValue).toBe("down");
  });

  it("is on when there is no original value", async () => {
    const { result } = renderHook(() => useAiProposal(undefined, "Janes Cottage"));
    expect(result.current.isAiMode).toBe(true);
    expect(result.current.effectiveValue).toBe("Janes Cottage");
  });

  it("ends on the first user edit", async () => {
    const { result } = renderHook(() => useAiProposal("up", "down"));
    act(() => result.current.onUserEdit());
    expect(result.current.isAiMode).toBe(false);
    expect(result.current.effectiveValue).toBe("up");
  });

  it("ends even when the value never changes", async () => {
    // The case that broke us: rejecting a proposal by re-entering the on-record value leaves `value`
    // untouched, so there is no value change to observe — only the edit event.
    const { result, rerender } = renderHook(({ value }) => useAiProposal(value, "down"), {
      initialProps: { value: "up" as string | undefined },
    });
    act(() => result.current.onUserEdit());
    rerender({ value: "up" });
    expect(result.current.isAiMode).toBe(false);
    expect(result.current.effectiveValue).toBe("up");
  });

  it("stays off once edited, even if the value later lands on the proposal", async () => {
    const { result, rerender } = renderHook(({ value }) => useAiProposal(value, "down"), {
      initialProps: { value: "up" as string | undefined },
    });
    act(() => result.current.onUserEdit());
    rerender({ value: "down" });
    expect(result.current.isAiMode).toBe(false);
    expect(result.current.effectiveValue).toBe("down");
  });

  it("stays on while the value changes externally but the user hasn't edited", async () => {
    // e.g. a cache refresh; only a user edit ends AI mode.
    const { result, rerender } = renderHook(({ value }) => useAiProposal(value, "down"), {
      initialProps: { value: "up" as string | undefined },
    });
    rerender({ value: "sideways" });
    expect(result.current.isAiMode).toBe(true);
    expect(result.current.effectiveValue).toBe("down");
  });
});
