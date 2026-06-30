import type { RAG } from "../types";
import { RAG_CLASSES, RAG_ICON, RAG_LABEL } from "../rag";

// RAG status with icon + text + color — never color alone (WCAG AA, PRD §8).
export function RagBadge({ status, size = "md" }: { status: RAG; size?: "sm" | "md" }) {
  const pad = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-sm";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-medium ${pad} ${RAG_CLASSES[status]}`}
      title={RAG_LABEL[status]}
    >
      <span aria-hidden="true">{RAG_ICON[status]}</span>
      <span>{RAG_LABEL[status]}</span>
    </span>
  );
}
