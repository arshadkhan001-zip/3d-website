import { useEffect } from "react";

const SITE = "Cover King Panipat — Phone Covers & Accessories";

/** Per-route document titles (+ meta description where given). */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | ${SITE}`;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}
