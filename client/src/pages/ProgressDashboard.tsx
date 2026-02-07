import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface ExerciseLog {
  id: string
  setsCompleted: number | null
  repsCompleted: number | null
  weightUsed: number | null
  completedAt: string
  notes: string | null
}

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number | null
  weight: number | null
  duration: number | null
  order: number
  notes: string | null
  logs: ExerciseLog[]
}

interface SessionData {
  id: string
  name: string
  trainee: { id: string; name: string }
  exercises: Exercise[]
}

function TrendIndicator({ current, previous }: { current: number | null; previous: number | null }) {
  if (current == null || previous == null) return null
  if (current > previous) return <span className="text-green-600 font-medium ml-1" title={`Up from ${previous}`}>&#9650;</span>
  if (current < previous) return <span className="text-red-500 font-medium ml-1" title={`Down from ${previous}`}>&#9660;</span>
  return <span className="text-muted-foreground ml-1" title="No change">&#9644;</span>
}

function ExerciseProgressCard({ exercise, sessionName }: { exercise: Exercise; sessionName: string }) {
  const { logs } = exercise
  const latest = logs.length > 0 ? logs[logs.length - 1] : null
  const previous = logs.length > 1 ? logs[logs.length - 2] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exercise.name}</CardTitle>
        <CardDescription>
          {sessionName} &middot; Target: {exercise.sets} sets
          {exercise.reps != null ? ` x ${exercise.reps} reps` : ''}
          {exercise.weight != null ? ` @ ${exercise.weight}kg` : ''}
          {exercise.duration != null ? ` | ${exercise.duration}s` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No logs recorded yet.</p>
        ) : (
          <>
            {latest && previous && (
              <div className="mb-4 p-3 rounded-md bg-secondary/30 text-sm">
                <p className="font-medium mb-1">Latest vs Previous</p>
                <div className="flex gap-4 flex-wrap">
                  {latest.weightUsed != null && (
                    <span>
                      Weight: {latest.weightUsed}kg
                      <TrendIndicator current={latest.weightUsed} previous={previous.weightUsed} />
                    </span>
                  )}
                  {latest.repsCompleted != null && (
                    <span>
                      Reps: {latest.repsCompleted}
                      <TrendIndicator current={latest.repsCompleted} previous={previous.repsCompleted} />
                    </span>
                  )}
                  {latest.setsCompleted != null && (
                    <span>
                      Sets: {latest.setsCompleted}
                      <TrendIndicator current={latest.setsCompleted} previous={previous.setsCompleted} />
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Sets</th>
                    <th className="pb-2 pr-4">Reps</th>
                    <th className="pb-2 pr-4">Weight</th>
                    <th className="pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {new Date(log.completedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-2 pr-4">{log.setsCompleted ?? '-'}</td>
                      <td className="py-2 pr-4">{log.repsCompleted ?? '-'}</td>
                      <td className="py-2 pr-4">{log.weightUsed != null ? `${log.weightUsed}kg` : '-'}</td>
                      <td className="py-2 text-muted-foreground">{log.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-3">{logs.length} total entries</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProgressDashboard() {
  const { user, logout } = useAuth()
  const { traineeId } = useParams<{ traineeId: string }>()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [error, setError] = useState('')
  const isTrainer = user?.role === 'TRAINER'

  useEffect(() => {
    const id = isTrainer ? traineeId : undefined
    api.getProgress(id).then(setSessions).catch((err) => setError(err.message))
  }, [traineeId, isTrainer])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const traineeName = sessions[0]?.trainee?.name
  const backPath = isTrainer ? (traineeId ? `/trainees/${traineeId}/sessions` : '/') : '/sessions'

  const allExercises = sessions.flatMap((s) =>
    s.exercises.map((ex) => ({ ...ex, sessionName: s.name }))
  )
  const exercisesWithLogs = allExercises.filter((ex) => ex.logs.length > 0)
  const exercisesWithoutLogs = allExercises.filter((ex) => ex.logs.length === 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backPath}>
              <Button variant="ghost" size="sm">&larr; Back</Button>
            </Link>
            <h1 className="text-xl font-bold">Meamen</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Progress Dashboard</h2>
          {traineeName && <p className="text-sm text-muted-foreground">{traineeName}</p>}
        </div>

        {allExercises.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No exercises found.</p>
        ) : (
          <>
            {exercisesWithLogs.length > 0 && (
              <div className="space-y-4">
                {exercisesWithLogs.map((ex) => (
                  <ExerciseProgressCard key={ex.id} exercise={ex} sessionName={ex.sessionName} />
                ))}
              </div>
            )}

            {exercisesWithoutLogs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">No logs yet</h3>
                {exercisesWithoutLogs.map((ex) => (
                  <Card key={ex.id} className="opacity-60">
                    <CardHeader>
                      <CardTitle className="text-base">{ex.name}</CardTitle>
                      <CardDescription>{ex.sessionName}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
