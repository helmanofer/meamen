import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Challenge {
  id: string
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
}

interface ScoreEntry {
  rank: number
  traineeId: string
  name: string
  score: number
  unit: string
}

function typeLabel(type: string): string {
  if (type === 'most_workouts') return 'Most Workout Days'
  if (type === 'total_weight') return 'Total Volume'
  if (type === 'consistency') return 'Consistency'
  return type
}

function timeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

export function ChallengeCard({
  challenge,
  currentUserId,
}: {
  challenge: Challenge
  currentUserId?: string
}) {
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    api.getChallengeScoreboard(challenge.id).then((data) => {
      setScoreboard(data.scoreboard)
    })
  }, [expanded, challenge.id])

  const now = Date.now()
  const isActive = new Date(challenge.startDate).getTime() <= now && new Date(challenge.endDate).getTime() >= now
  const isPast = new Date(challenge.endDate).getTime() < now

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${isActive ? 'border-orange-300 bg-orange-50/30' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="!pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isActive ? '🏋️' : isPast ? '🏁' : '📅'}</span>
            <CardTitle className="text-base">{challenge.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {typeLabel(challenge.type)}
            </span>
            {isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                {timeRemaining(challenge.endDate)}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {challenge.description && (
            <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
          )}
          <div className="text-xs text-muted-foreground mb-2">
            {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
          </div>
          {scoreboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No scores yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-1.5 pr-3 font-medium">#</th>
                    <th className="py-1.5 pr-3 font-medium">Name</th>
                    <th className="py-1.5 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreboard.map((s) => (
                    <tr
                      key={s.traineeId}
                      className={`border-b last:border-0 ${s.traineeId === currentUserId ? 'bg-primary/5 font-medium' : ''}`}
                    >
                      <td className="py-1.5 pr-3">
                        {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : s.rank}
                      </td>
                      <td className="py-1.5 pr-3">{s.name}</td>
                      <td className="py-1.5 text-right">
                        <span className="font-semibold">{s.score}</span>{' '}
                        <span className="text-xs text-muted-foreground">{s.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
