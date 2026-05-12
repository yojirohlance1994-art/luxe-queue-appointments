type Props = { status: string; className?: string };

export function StatusBadge({ status, className = "" }: Props) {
  const s = status === "queued" ? "pending" : status === "in_progress" ? "in_service" : status;
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    accepted: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    in_service: "bg-primary/25 text-primary-foreground border-primary/50",
    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cancelled: "bg-destructive/15 text-destructive-foreground border-destructive/30",
    declined: "bg-destructive/15 text-destructive-foreground border-destructive/30",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-semibold ${map[s] ?? "bg-white/5 border-white/10 text-foreground"} ${className}`}>
      {s.replace("_", " ")}
    </span>
  );
}
