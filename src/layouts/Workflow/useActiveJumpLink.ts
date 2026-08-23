import { useEffect, useState } from "react";
import { stickyNavAndHeaderOffsetPx } from "../layoutVars";

/** Tracks which jump-link section is under the sticky header as the page scrolls. */
export function useActiveJumpLink(sectionIds: string[]): string | undefined {
  const idsKey = sectionIds.join("\0");
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const ids = idsKey.length === 0 ? [] : idsKey.split("\0");
    setActiveId((current) => (current && ids.includes(current) ? current : ids[0]));
  }, [idsKey]);

  useEffect(() => {
    const ids = idsKey.length === 0 ? [] : idsKey.split("\0");
    if (ids.length === 0) return;

    const update = () => {
      const first = ids.map((id) => document.getElementById(id)).find((el) => el !== null);
      if (!first) return;
      const headerOffset = stickyNavAndHeaderOffsetPx(first);
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - headerOffset <= 1) {
          current = id;
        }
      }
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [idsKey]);

  return activeId;
}
