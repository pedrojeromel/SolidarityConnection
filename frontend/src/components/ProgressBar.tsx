interface ProgressBarProps {
  raised: number
  goal: number
  pending?: boolean
}

export function ProgressBar({ raised, goal, pending = false }: ProgressBarProps) {
  const percent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between font-mono text-[11px]">
        <span className="text-muted">{percent.toFixed(1)}% da meta</span>

        {pending && (
          <span className="flex items-center gap-1.5 text-brand-2">
            <span className="status-dot !bg-brand-2" />
            confirmando…
          </span>
        )}
      </div>
    </div>
  )
}
