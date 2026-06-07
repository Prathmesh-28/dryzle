import { cn } from "@/lib/utils";
import { statusColor } from "@/lib/format";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap",
        statusColor(status),
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
