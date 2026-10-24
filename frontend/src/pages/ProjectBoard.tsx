import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Modal, ModalSection, modalFieldClass } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import {
  getErrorMessage,
  useAddStageMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetAssigneesQuery,
  useGetProjectQuery,
  useGetTasksQuery,
  useMoveTaskStageMutation,
  useUpdateTaskMutation,
} from '../store/api'
import type { TaskPriority } from '../types'

const stageColors = ['#fdab3d', '#0073ea', '#00c875', '#ff7575', '#9d50dd', '#037f4c']

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-[#e8f5e9] text-[#2e7d32]',
  medium: 'bg-[#fff3e0] text-[#ef6c00]',
  high: 'bg-[#fdecea] text-[#c62828]',
}

export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const {
    data: project,
    error: projectError,
    isLoading: projectLoading,
  } = useGetProjectQuery(id!, { skip: !id })
  const { data: tasks = [], error: tasksError } = useGetTasksQuery(id, { skip: !id })
  const { data: assignees = [] } = useGetAssigneesQuery()

  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation()
  const [addStage, { isLoading: addingStage }] = useAddStageMutation()
  const [moveTaskStage] = useMoveTaskStageMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [updateTask] = useUpdateTaskMutation()

  const [error, setError] = useState('')
  const [taskOpen, setTaskOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [activeStageId, setActiveStageId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [stageName, setStageName] = useState('')

  const stages = useMemo(
    () => [...(project?.stages || [])].sort((a, b) => a.position - b.position),
    [project],
  )

  function colorForStage(index: number) {
    return stageColors[index % stageColors.length]
  }

  function assigneeName(assigneeIdValue: number) {
    const person = assignees.find((a) => a.id === assigneeIdValue)
    return person ? person.name : `User #${assigneeIdValue}`
  }

  function openCreateTask(stageId: number) {
    setActiveStageId(stageId)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setAssigneeId(String(user?.id || ''))
    setTaskOpen(true)
  }

  async function handleCreateTask(e: FormEvent) {
    e.preventDefault()
    if (activeStageId == null || !id) return
    setError('')
    try {
      await createTask({
        title,
        description,
        project_id: Number(id),
        stage_id: activeStageId,
        assignee_id: Number(assigneeId),
        priority,
      }).unwrap()
      setTaskOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handlePriorityChange(taskId: number, next: string) {
    setError('')
    try {
      await updateTask({
        id: taskId,
        priority: next as TaskPriority,
      }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleAddStage(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setError('')
    try {
      await addStage({ projectId: id, name: stageName }).unwrap()
      setStageName('')
      setStageOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleMove(taskId: number, stageId: string) {
    try {
      await moveTaskStage({ id: taskId, stageId: Number(stageId) }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const displayError =
    error ||
    (projectError ? getErrorMessage(projectError) : '') ||
    (tasksError ? getErrorMessage(tasksError) : '')

  if (projectLoading) {
    return <p className="text-ink-soft">Loading board…</p>
  }

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="text-sm font-medium text-[#0073ea] hover:underline">
            ← Projects
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {project?.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            {project?.description || 'Kanban board for this project.'}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setStageOpen(true)}>
          Add stage
        </Button>
      </div>

      {displayError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
          {displayError}
        </p>
      )}

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {stages.map((stage, index) => {
          const stageTasks = tasks.filter((t) => t.stage_id === stage.id)
          const accent = colorForStage(index)
          return (
            <section
              key={stage.id}
              className="flex w-[280px] shrink-0 flex-col rounded-2xl bg-[#f6f7fb] shadow-sm"
            >
              <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: accent }} />
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
                  <div>
                    <h2 className="text-sm font-bold capitalize text-ink">{stage.name}</h2>
                    <p className="text-[11px] text-ink-soft">{stageTasks.length} items</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => openCreateTask(stage.id)}
                  className="text-ink shadow-sm hover:bg-ink hover:text-white"
                >
                  + Add
                </Button>
              </div>
              <ul className="flex flex-1 flex-col gap-2.5 px-3 pb-3">
                {stageTasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-xl border border-black/5 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink">{task.title}</h3>
                      <span
                        className={[
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                          priorityStyles[task.priority] || priorityStyles.medium,
                        ].join(' ')}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-3 text-xs text-ink-soft">
                      {task.description || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0073ea]/10 text-[10px] font-bold text-[#0073ea]">
                        {assigneeName(task.assignee_id).slice(0, 1)}
                      </span>
                      <span className="truncate text-[11px] text-ink-soft">
                        {assigneeName(task.assignee_id)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <select
                        aria-label="Move stage"
                        value={task.stage_id}
                        onChange={(e) => handleMove(task.id, e.target.value)}
                        className="rounded-md border border-black/5 bg-[#f6f7fb] px-2 py-1 text-[11px]"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="Change priority"
                        value={task.priority}
                        onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                        className="rounded-md border border-black/5 bg-[#f6f7fb] px-2 py-1 text-[11px] capitalize"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-0 text-[11px] font-medium"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
                {stageTasks.length === 0 && (
                  <li className="rounded-xl border border-dashed border-black/10 bg-white/50 px-3 py-8 text-center text-xs text-ink-soft">
                    Drop work here
                  </li>
                )}
              </ul>
            </section>
          )
        })}
      </div>

      {taskOpen && (
        <Modal
          title="Create task"
          subtitle="Add work to this column and assign someone."
          onClose={() => setTaskOpen(false)}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setTaskOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-task" variant="ink" disabled={creatingTask}>
                {creatingTask ? 'Creating…' : 'Create'}
              </Button>
            </>
          }
        >
          <form id="create-task" onSubmit={handleCreateTask} className="space-y-5">
            <ModalSection label="Task details">
              <div className="space-y-3">
                <div>
                  <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-ink">
                    Title
                  </label>
                  <input
                    id="task-title"
                    required
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={modalFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="task-desc" className="mb-1.5 block text-sm font-medium text-ink">
                    Description
                    <span className="ml-1 font-normal text-black/40">(optional)</span>
                  </label>
                  <textarea
                    id="task-desc"
                    rows={3}
                    placeholder="Add context for the assignee"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${modalFieldClass} resize-none`}
                  />
                </div>
                <div>
                  <label htmlFor="task-priority" className="mb-1.5 block text-sm font-medium text-ink">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className={modalFieldClass}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </ModalSection>

            <ModalSection label="People with access">
              <div>
                <label htmlFor="assignee" className="mb-1.5 block text-sm font-medium text-ink">
                  Assign to
                </label>
                <select
                  id="assignee"
                  required
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className={modalFieldClass}
                >
                  {assignees.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.email})
                      {person.id === user?.id ? ' — you' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </ModalSection>
          </form>
        </Modal>
      )}

      {stageOpen && (
        <Modal
          title="Add stage"
          subtitle="Create another column on this board."
          onClose={() => setStageOpen(false)}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setStageOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="add-stage" variant="ink" disabled={addingStage}>
                {addingStage ? 'Adding…' : 'Add stage'}
              </Button>
            </>
          }
        >
          <form id="add-stage" onSubmit={handleAddStage}>
            <ModalSection label="Stage details">
              <div>
                <label htmlFor="stage-name" className="mb-1.5 block text-sm font-medium text-ink">
                  Name
                </label>
                <input
                  id="stage-name"
                  required
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="e.g. Review"
                  className={modalFieldClass}
                />
              </div>
            </ModalSection>
          </form>
        </Modal>
      )}
    </div>
  )
}
