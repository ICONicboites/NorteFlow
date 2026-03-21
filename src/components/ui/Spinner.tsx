export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={[
        "h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900/80 dark:border-slate-800 dark:border-t-slate-50/80",
        className ?? "",
      ].join(" ")}
    />
  );
}

