import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const diff = current - previous
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-green-600 ml-1" title={`Up from ${previous}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span className="text-xs font-medium">+{diff}</span>
      </span>
    )
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-500 ml-1" title={`Down from ${previous}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span className="text-xs font-medium">{diff}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-muted-foreground ml-1" title="No change">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    </span>
  )
}

function EditLogFormInline({ log, onDone }: { log: ExerciseLog; onDone: () => void }) {
  const [sets, setSets] = useState(log.setsCompleted != null ? String(log.setsCompleted) : '')
  const [reps, setReps] = useState(log.repsCompleted != null ? String(log.repsCompleted) : '')
  const [weight, setWeight] = useState(log.weightUsed != null ? String(log.weightUsed) : '')
  const [notes, setNotes] = useState(log.notes ?? '')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.updateExerciseLog(log.id, {
      setsCompleted: sets ? Number(sets) : undefined,
      repsCompleted: reps ? Number(reps) : undefined,
      weightUsed: weight ? Number(weight) : undefined,
      notes: notes || undefined,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded-lg bg-secondary/30 space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase">Edit Log Entry</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" />
        </div>
        <div>
          <Label className="text-xs">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10" />
        </div>
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="20" />
        </div>
      </div>
      <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save Changes</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

function ExerciseProgressCard({ exercise, sessionName, onRefresh }: { exercise: Exercise; sessionName: string; onRefresh: () => void }) {
  const { logs } = exercise
  const latest = logs.length > 0 ? logs[logs.length - 1] : null
  const previous = logs.length > 1 ? logs[logs.length - 2] : null
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm('Delete this log entry?')) return
    await api.deleteExerciseLog(logId)
    onRefresh()
  }

  const hasWeight = logs.some(l => l.weightUsed != null)
  const hasReps = logs.some(l => l.repsCompleted != null)
  const hasSets = logs.some(l => l.setsCompleted != null)

  const getTrend = (current: number | null, previous: number | null) => {
    if (current == null || previous == null) return null
    const diff = current - previous
    if (diff > 0) return { icon: 'up', diff: `+${diff}`, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    if (diff < 0) return { icon: 'down', diff: diff.toString(), color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    return { icon: 'same', diff: '', color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border' }
  }

  const weightTrend = latest?.weightUsed != null ? getTrend(latest.weightUsed, previous?.weightUsed ?? null) : null
  const repsTrend = latest?.repsCompleted != null ? getTrend(latest.repsCompleted, previous?.repsCompleted ?? null) : null

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full text-left hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 pr-2">
              <CardTitle className="text-base truncate">{exercise.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-0.5 flex-wrap text-xs">
                <span className="truncate max-w-[80px]">{sessionName}</span>
                <span className="text-border">&middot;</span>
                <span>{exercise.sets} sets</span>
                {exercise.reps != null && <><span className="text-border">&middot;</span><span>{exercise.reps} reps</span></>}
                {exercise.weight != null && <><span className="text-border">&middot;</span><span>{exercise.weight}kg</span></>}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(weightTrend || repsTrend) && (
                <div className="flex gap-1">
                  {weightTrend && weightTrend.icon !== 'same' && (
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${weightTrend.bg} ${weightTrend.color} border ${weightTrend.border}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={weightTrend.icon === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                      </svg>
                      <span>{latest?.weightUsed}kg</span>
                    </span>
                  )}
                  {repsTrend && repsTrend.icon !== 'same' && (
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${repsTrend.bg} ${repsTrend.color} border ${repsTrend.border}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={repsTrend.icon === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                      </svg>
                      <span>{latest?.repsCompleted}</span>
                    </span>
                  )}
                </div>
              )}
              {logs.length > 0 && (
                <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{logs.length}</span>
              )}
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </CardHeader>
      </button>

      {expanded && (
        <div className="border-t border-border/50 bg-card">
          <CardContent className="p-4 space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No logs recorded yet. Complete this exercise to see your progress.</p>
            ) : (
              <>
                {latest && previous && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-secondary/50 to-secondary/20 border border-border/60">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progress Trend</p>
                      <span className="text-xs text-muted-foreground">Latest vs Previous</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {latest.weightUsed != null && hasWeight && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-bold">{latest.weightUsed}<span className="text-sm font-normal text-muted-foreground">kg</span></span>
                            <TrendIndicator current={latest.weightUsed} previous={previous.weightUsed} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Weight</p>
                        </div>
                      )}
                      {latest.repsCompleted != null && hasReps && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-bold">{latest.repsCompleted}</span>
                            <TrendIndicator current={latest.repsCompleted} previous={previous.repsCompleted} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Reps</p>
                        </div>
                      )}
                      {latest.setsCompleted != null && hasSets && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-bold">{latest.setsCompleted}</span>
                            <TrendIndicator current={latest.setsCompleted} previous={previous.setsCompleted} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Sets</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Log History</p>
                  <div className="space-y-2">
                    {[...logs].reverse().slice(0, expanded ? undefined : 5).map((log, idx) => (
                      <div key={log.id}>
                        {editingLogId === log.id ? (
                          <EditLogFormInline key={`edit-${log.id}`} log={log} onDone={() => { setEditingLogId(null); onRefresh() }} />
                        ) : (
                          <div className={`p-3 rounded-lg border ${idx === 0 ? 'bg-primary/5 border-primary/20' : 'bg-secondary/20 border-border/50'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {new Date(log.completedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {idx === 0 && <span className="hidden xs:inline text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Latest</span>}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingLogId(log.id)}
                                  className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                  title="Edit log"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteLog(log.id)}
                                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Delete log"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                              {log.setsCompleted != null && (
                                <span className="font-semibold">{log.setsCompleted}<span className="text-muted-foreground ml-0.5">sets</span></span>
                              )}
                              {log.repsCompleted != null && (
                                <span className="font-semibold">{log.repsCompleted}<span className="text-muted-foreground ml-0.5">reps</span></span>
                              )}
                              {log.weightUsed != null && (
                                <span className="font-semibold">{log.weightUsed}<span className="text-muted-foreground ml-0.5">kg</span></span>
                              )}
                              {log.notes && (
                                <span className="text-muted-foreground text-xs italic">"{log.notes}"</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {logs.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Showing {Math.min(5, logs.length)} of {logs.length} logs
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  )
}

export default function ProgressDashboard() {
  const { user, logout } = useAuth()
  const { traineeId } = useParams<{ traineeId: string }>()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [error, setError] = useState('')
  const isTrainer = user?.role === 'TRAINER'

  const loadProgress = useCallback(() => {
    const id = isTrainer ? traineeId : undefined
    api.getProgress(id).then(setSessions).catch((err) => setError(err.message))
  }, [traineeId, isTrainer])

  useEffect(() => { loadProgress() }, [loadProgress])

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

  const totalLogs = allExercises.reduce((acc, ex) => acc + ex.logs.length, 0)
  const activeExercises = allExercises.filter(ex => ex.logs.length > 0).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backPath}>
              <Button variant="ghost" size="sm">&larr; Back</Button>
            </Link>
            <div className="flex items-center">
              <img src="/logo.png" alt="Meamen" className="h-16 w-auto object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-semibold">Progress</h2>
            {traineeName && <p className="text-sm text-muted-foreground">{traineeName}</p>}
          </div>
          {totalLogs > 0 && (
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-xl font-bold">{activeExercises}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{totalLogs}</p>
                <p className="text-xs text-muted-foreground">Total Logs</p>
              </div>
            </div>
          )}
        </div>

        {allExercises.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No exercises found.</p>
          </Card>
        ) : (
          <>
            {exercisesWithLogs.length > 0 && (
              <div className="space-y-3">
                {exercisesWithLogs.map((ex) => (
                  <ExerciseProgressCard key={ex.id} exercise={ex} sessionName={ex.sessionName} onRefresh={loadProgress} />
                ))}
              </div>
            )}

            {exercisesWithoutLogs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Not Started ({exercisesWithoutLogs.length})
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {exercisesWithoutLogs.map((ex) => (
                    <Card key={ex.id} className="p-3 opacity-60 hover:opacity-80 transition-opacity border-dashed">
                      <CardContent className="p-0">
                        <p className="font-medium text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ex.sessionName}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
