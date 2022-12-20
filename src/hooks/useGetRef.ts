import { MutableRefObject, RefObject, useRef } from "react";

export const useGetRef = <T extends HTMLElement>(maybeRef: RefObject<T> | undefined): MutableRefObject<T | null> => {
  const newRef = useRef(null);
  return maybeRef || newRef;
};
