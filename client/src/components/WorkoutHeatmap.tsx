interface WorkoutHeatmapProps {
  /** Map of "YYYY-MM-DD" -> exercise count */
  activityDays: Record<string, number>
  /** Show compact version (current week only, inline) */
  compact?: boolean
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function intensityColor(count: number): string {
  if (count === 0) return '#ebedf0'
  if (count === 1) return '#9be9a8'
  if (count <= 3) return '#40c463'
  if (count <= 5) return '#30a14e'
  return '#216e39'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Compact: current week as 7 small dots */
function CompactHeatmap({ activityDays }: { activityDays: Record<string, number> }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() // 0=Sun

  // Start from Monday of current week
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const days: Array<{ date: string; count: number; label: string; future: boolean }> = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({
      date: dateStr,
      count: activityDays[dateStr] || 0,
      label: DAY_NAMES_SHORT[d.getDay()],
      future: d > today,
    })
  }

  return (
    <div className="flex items-center gap-1">
      {days.map((d) => (
        <div key={d.date} className="flex flex-col items-center gap-0.5" title={`${d.label} ${formatDate(d.date)}: ${d.count}`}>
          <span className="text-[9px] text-muted-foreground leading-none">{d.label[0]}</span>
          <span
            className="block rounded-sm"
            style={{
              width: 14,
              height: 14,
              backgroundColor: d.future ? 'transparent' : intensityColor(d.count),
              border: d.future ? '1px dashed #d1d5db' : 'none',
            }}
          />
        </div>
      ))}
    </div>
  )
}

/** Full: 52-week GitHub-style grid */
function FullHeatmap({ activityDays }: { activityDays: Record<string, number> }) {
  const cellSize = 11
  const gap = 3
  const step = cellSize + gap

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDay = today.getDay()

  // End on current Saturday
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + (6 - todayDay))

  // 52 weeks back
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - 52 * 7 + 1)

  // Build weeks
  const weeks: Array<Array<{ date: string; count: number; future: boolean }>> = []
  const cursor = new Date(startDate)
  let week: typeof weeks[number] = []

  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().slice(0, 10)
    const dow = cursor.getDay()

    if (dow === 0 && week.length > 0) {
      weeks.push(week)
      week = []
    }

    week.push({
      date: dateStr,
      count: activityDays[dateStr] || 0,
      future: cursor > today,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  if (week.length > 0) weeks.push(week)

  // Month markers
  const monthMarkers: Array<{ weekIndex: number; label: string }> = []
  let lastMonth = -1
  for (let w = 0; w < weeks.length; w++) {
    const first = weeks[w][0]
    if (first) {
      const m = new Date(first.date + 'T00:00:00').getMonth()
      if (m !== lastMonth) {
        monthMarkers.push({ weekIndex: w, label: MONTH_LABELS[m] })
        lastMonth = m
      }
    }
  }

  const labelW = 30
  const headerH = 18
  const svgW = labelW + weeks.length * step
  const svgH = headerH + 7 * step

  return (
    <div>
      <div className="overflow-x-auto">
        <svg width={svgW} height={svgH} style={{ display: 'block' }}>
          {/* Month labels */}
          {monthMarkers.map((m) => (
            <text
              key={m.weekIndex}
              x={labelW + m.weekIndex * step}
              y={12}
              fill="#8b949e"
              fontSize={10}
              fontFamily="system-ui, sans-serif"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text
                key={i}
                x={0}
                y={headerH + i * step + cellSize - 2}
                fill="#8b949e"
                fontSize={9}
                fontFamily="system-ui, sans-serif"
              >
                {label}
              </text>
            ) : null
          )}

          {/* Cells */}
          {weeks.map((wk, wi) =>
            wk.map((day) => {
              const dow = new Date(day.date + 'T00:00:00').getDay()
              return (
                <rect
                  key={day.date}
                  x={labelW + wi * step}
                  y={headerH + dow * step}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={day.future ? 'transparent' : intensityColor(day.count)}
                >
                  <title>{`${formatDate(day.date)}: ${day.count} exercise${day.count !== 1 ? 's' : ''}`}</title>
                </rect>
              )
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground justify-end">
        <span>Less</span>
        {[0, 1, 2, 4, 6].map((n) => (
          <span
            key={n}
            className="inline-block rounded-sm"
            style={{ width: cellSize, height: cellSize, backgroundColor: intensityColor(n) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export function WorkoutHeatmap({ activityDays, compact = false }: WorkoutHeatmapProps) {
  return compact
    ? <CompactHeatmap activityDays={activityDays} />
    : <FullHeatmap activityDays={activityDays} />
}
