import { useCallback, useEffect } from "react";
import { useSnackbarContext } from "src/components/Snackbar/SnackbarContext";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { maybeCall } from "src/utils";
import { Offset } from "./Snackbar";

export interface UseSnackbarHook {
  triggerNotice: (props: TriggerNoticeProps) => { close: () => void };
  closeNotice: (id: string) => void;
  useSnackbarOffset: (offset: Offset) => void;
}

export function useSnackbar(): UseSnackbarHook {
  const { setNotices, setOffset } = useSnackbarContext();

  const onClose = useCallback((noticeId: string) => {
    setNotices((prev) => {
      let returnValue = prev;

      // check to see if the notice is still in our existing stack, if so then remove it. Otherwise it was manually closed, so return the existing value.
      if (prev.some(({ id }) => id === noticeId)) {
        returnValue = prev.filter(({ id }) => id !== noticeId);
      }

      // For good measure, reset the snackbarId when notices array is emptied.
      if (returnValue.length === 0) {
        snackbarId = 1;
      }

      return returnValue;
    });
  }, []);

  const triggerNotice = useCallback(
    (props) => {
      // Sets `noticeId` to the current value of `snackbarId` and then increments.
      const noticeId = props.id ?? `beamSnackbar:${snackbarId++}`;
      let maybeTimeout: number | undefined;

      if (!props.persistent) {
        maybeTimeout = window.setTimeout(() => {
          onClose(noticeId);
          // Auto close in 10s
        }, 10_000);
      }

      setNotices((prev) =>
        prev.concat({
          ...props,
          id: noticeId,
          onClose: () => {
            // Because we reset the `snackbarId` if the notices array is empty, then we need to call `clearTimeout` to ensure we don't accidentally close the wrong notice
            clearTimeout(maybeTimeout);
            onClose(noticeId);
            maybeCall(props.onClose);
          },
        }),
      );

      return {
        close: () => {
          // Because we reset the `snackbarId` if the notices array is empty, then we need to call `clearTimeout` to ensure we don't accidentally close the wrong notice
          clearTimeout(maybeTimeout);
          onClose(noticeId);
        },
      };
    },
    [onClose, setNotices],
  );

  const closeNotice = useCallback((id: string) => onClose(id), [onClose]);

  const useSnackbarOffset = ({ bottom }: Offset) =>
    useEffect(() => {
      setOffset({ bottom });
      return () => setOffset({});
    }, [bottom]);

  return { triggerNotice, closeNotice, useSnackbarOffset };
}

let snackbarId = 1;

// Make `id` optional. Allows for implementations to systematically close an alert by a provided id.
export interface TriggerNoticeProps extends Omit<SnackbarNoticeProps, "id" | "onClose"> {
  id?: string;
  onClose?: () => void;
}
