import { TRACKER_STATUS_META } from "@/lib/tracker/constants";
import type { TrackerStatus } from "@/lib/tracker/types";
import { cn } from "@/lib/utils";

const toneClasses = {
  green: "bg-green-soft text-green",
  yellow: "bg-yellow-soft text-yellow",
  red: "bg-red-soft text-red",
  neutral: "bg-surface-muted text-foreground",
} as const;

export function StatusBadge({ status }: { status: TrackerStatus }) {
  const meta = TRACKER_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
        toneClasses[meta.tone],
      )}
    >
      <span className="size-2.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}
