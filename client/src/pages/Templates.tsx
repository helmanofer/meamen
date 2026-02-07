import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface TemplateExercise {
  id: string
  name: string
  sets: number
  reps: number | null
  weight: number | null
  duration: number | null
  youtubeUrl: string | null
  order: number
  notes: string | null
}

interface Template {
  id: string
  name: string
  exercises: TemplateExercise[]
}

function AddExerciseForm({ templateId, order, onDone }: { templateId: string; order: number; onDone: () => void }) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.addTemplateExercise(templateId, {
      name,
      sets: Number(sets),
      reps: reps ? Number(reps) : undefined,
      weight: weight ? Number(weight) : undefined,
      duration: duration ? Number(duration) : undefined,
      youtubeUrl: youtubeUrl || undefined,
      notes: notes || undefined,
    })
    setName('')
    setSets('3')
    setReps('')
    setWeight('')
    setDuration('')
    setYoutubeUrl('')
    setNotes('')
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded-md space-y-3 bg-secondary/30">
      <p className="text-sm font-medium">Add Exercise</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Squat" required />
        </div>
        <div>
          <Label className="text-xs">YouTube URL</Label>
          <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="-" />
        </div>
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="-" />
        </div>
        <div>
          <Label className="text-xs">Duration (sec)</Label>
          <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="-" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Add</Button>
      </div>
    </form>
  )
}

function EditExerciseForm({ templateId, exercise, onDone }: { templateId: string; exercise: TemplateExercise; onDone: () => void }) {
  const [name, setName] = useState(exercise.name)
  const [sets, setSets] = useState(String(exercise.sets))
  const [reps, setReps] = useState(exercise.reps != null ? String(exercise.reps) : '')
  const [weight, setWeight] = useState(exercise.weight != null ? String(exercise.weight) : '')
  const [duration, setDuration] = useState(exercise.duration != null ? String(exercise.duration) : '')
  const [youtubeUrl, setYoutubeUrl] = useState(exercise.youtubeUrl ?? '')
  const [notes, setNotes] = useState(exercise.notes ?? '')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.updateTemplateExercise(templateId, exercise.id, {
      name,
      sets: Number(sets),
      reps: reps ? Number(reps) : null,
      weight: weight ? Number(weight) : null,
      duration: duration ? Number(duration) : null,
      youtubeUrl: youtubeUrl || null,
      notes: notes || null,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 border rounded-md space-y-3 bg-secondary/30">
      <p className="text-sm font-medium">Edit Exercise</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label className="text-xs">YouTube URL</Label>
          <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="-" />
        </div>
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="-" />
        </div>
        <div>
          <Label className="text-xs">Duration (sec)</Label>
          <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="-" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

export default function Templates() {
  const { user, logout } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null)
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [editTemplateName, setEditTemplateName] = useState('')

  const loadTemplates = useCallback(() => {
    api.getTemplates().then(setTemplates).catch(console.error)
  }, [])

  useEffect(() => { loadTemplates() }, [loadTemplates])

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await api.createTemplate({ name: templateName })
    setTemplateName('')
    setShowCreateForm(false)
    loadTemplates()
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Delete this template? This will also delete all its exercises.')) return
    await api.deleteTemplate(id)
    loadTemplates()
  }

  const handleDeleteExercise = async (templateId: string, exerciseId: string) => {
    if (!window.confirm('Delete this exercise from the template?')) return
    await api.deleteTemplateExercise(templateId, exerciseId)
    loadTemplates()
  }

  const handleUpdateTemplateName = async (id: string) => {
    await api.updateTemplate(id, { name: editTemplateName })
    setEditingTemplateId(null)
    loadTemplates()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Session Templates</h2>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create Template'}
          </Button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              placeholder="Template name (e.g. Leg Day)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
            />
            <Button type="submit">Create</Button>
          </form>
        )}

        {templates.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No templates yet. Create your first template to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingTemplateId === t.id ? (
                        <form
                          className="flex gap-2"
                          onSubmit={(e) => { e.preventDefault(); handleUpdateTemplateName(t.id) }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={editTemplateName}
                            onChange={(e) => setEditTemplateName(e.target.value)}
                            required
                          />
                          <Button type="submit" size="sm">Save</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setEditingTemplateId(null)}>Cancel</Button>
                        </form>
                      ) : (
                        <>
                          <CardTitle>{t.name}</CardTitle>
                          <CardDescription>
                            {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}
                            {expandedId !== t.id && ' — click to expand'}
                          </CardDescription>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditTemplateName(t.name)
                          setEditingTemplateId(editingTemplateId === t.id ? null : t.id)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTemplate(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedId === t.id && (
                  <CardContent className="space-y-3">
                    {t.exercises.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No exercises yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {t.exercises.map((ex) => (
                          <div key={ex.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{ex.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {ex.sets} sets
                                {ex.reps != null ? ` x ${ex.reps} reps` : ''}
                                {ex.weight != null ? ` @ ${ex.weight}kg` : ''}
                                {ex.duration != null ? ` | ${ex.duration}s` : ''}
                              </p>
                              {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                              {editingExerciseId === ex.id && (
                                <EditExerciseForm
                                  templateId={t.id}
                                  exercise={ex}
                                  onDone={() => { setEditingExerciseId(null); loadTemplates() }}
                                />
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingExerciseId(editingExerciseId === ex.id ? null : ex.id)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteExercise(t.id, ex.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addingExerciseId === t.id ? (
                      <AddExerciseForm
                        templateId={t.id}
                        order={t.exercises.length}
                        onDone={() => { setAddingExerciseId(null); loadTemplates() }}
                      />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddingExerciseId(t.id)}
                      >
                        Add Exercise
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
