import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";

export enum AutoSaveStatus {
  IDLE = "idle",
  SAVING = "saving",
  DONE = "done",
  ERROR = "error",
}

export interface AutoSaveStatusContextType {
  status: AutoSaveStatus;
  /** Resets status to IDLE, particularly useful if "Error" or "Done" is stale */
  resetStatus: VoidFunction;
  errors: unknown[];
  /** Notifies AutoSaveContext that a request is in-flight */
  triggerAutoSave: VoidFunction;
  /** Notifies AutoSaveContext that a request has settled, optionally taking an error */
  resolveAutoSave: (error?: unknown) => void;
}

export const AutoSaveStatusContext = React.createContext<AutoSaveStatusContextType>({
  status: AutoSaveStatus.IDLE,
  resetStatus() {},
  errors: [],
  triggerAutoSave() {},
  resolveAutoSave() {},
});

type AutoSaveStatusProviderProps = PropsWithChildren<{
  /** After a successful save, reset Status back to `Idle` after this many milliseconds */
  resetToIdleTimeout?: number;
}>;

export function AutoSaveStatusProvider({ children, resetToIdleTimeout = 6_000 }: AutoSaveStatusProviderProps) {
  const [status, setStatus] = useState(AutoSaveStatus.IDLE);
  const [errors, setErrors] = useState<unknown[]>([]);
  const [inFlight, setInFlight] = useState(0);
  const resetToIdleTimeoutRef = useRef<number | null>(null);

  /** Handles setting Status */
  useEffect(() => {
    if (inFlight > 0) return setStatus(AutoSaveStatus.SAVING);
    if (status === AutoSaveStatus.IDLE) return;
    if (errors.length) return setStatus(AutoSaveStatus.ERROR);
    return setStatus(AutoSaveStatus.DONE);
  }, [errors.length, inFlight, status]);

  const triggerAutoSave = useCallback(() => {
    setInFlight((c) => c + 1);
    setErrors([]);
  }, []);

  const resolveAutoSave = useCallback((error?: unknown) => {
    setInFlight((c) => Math.max(0, c - 1));
    if (error) setErrors((errs) => errs.concat(error));
  }, []);

  const resetStatus = useCallback(() => {
    setStatus(AutoSaveStatus.IDLE);
    setErrors([]);
  }, []);

  /** Resets AutoSaveStatus from "Done" to "Idle" after a timeout, if one is provided */
  useEffect(() => {
    if (resetToIdleTimeout === undefined) return;

    // Specifically avoid auto-reset if Errors are present
    if (status !== AutoSaveStatus.DONE) return;

    // Only run the latest Timeout
    if (resetToIdleTimeoutRef.current) clearTimeout(resetToIdleTimeoutRef.current);

    resetToIdleTimeoutRef.current = window.setTimeout(() => {
      resetStatus();
      resetToIdleTimeoutRef.current = null;
    }, resetToIdleTimeout);
  }, [resetStatus, resetToIdleTimeout, status]);

  const value = useMemo(
    () => ({ status, resetStatus, errors, triggerAutoSave, resolveAutoSave }),
    [errors, resetStatus, resolveAutoSave, status, triggerAutoSave],
  );

  return <AutoSaveStatusContext.Provider value={value}>{children}</AutoSaveStatusContext.Provider>;
}
