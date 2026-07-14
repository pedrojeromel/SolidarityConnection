interface ProgressBarProps {
  raised: number
  goal: number
  pending?: boolean
}

export function ProgressBar({ raised, goal, pending = false }: ProgressBarProps) {
  const percent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

  return (
    <div className="space-y-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon via-violet to-magenta transition-[width] duration-1000 ease-out"
          style={{ width: `${percent}%` }}
        />

        {/* Enquanto o evento nao foi consumido, a barra "respira" para indicar
            que existe uma doacao em transito na fila. */}
        {pending && (
          <div className="shimmer pointer-events-none absolute inset-0 overflow-hidden rounded-full" />
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neon-soft">
          {percent.toFixed(1)}% da meta
        </span>

        {pending && (
          <span className="animate-pulse-glow font-medium text-magenta">
            processando na fila...
          </span>
        )}
      </div>
    </div>
  )
}
