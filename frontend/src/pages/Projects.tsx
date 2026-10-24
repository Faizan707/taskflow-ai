import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Modal, ModalSection, modalFieldClass } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import {
  getErrorMessage,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
} from '../store/api'

const accents = ['#fdab3d', '#0073ea', '#00c875', '#ff7575', '#037f4c']

export default function Projects() {
  const { isStaff } = useAuth()
  const { data: projects = [], error: listError } = useGetProjectsQuery()
  const [createProject, { isLoading: creating }] = useCreateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()

  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await createProject({ name, description }).unwrap()
      setName('')
      setDescription('')
      setOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project and its tasks?')) return
    try {
      await deleteProject(id).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const displayError = error || (listError ? getErrorMessage(listError) : '')

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Projects</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isStaff
              ? 'Every board across the workspace.'
              : 'Your boards — each starts with todo, in progress, and done.'}
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          + New project
        </Button>
      </div>

      {displayError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
          {displayError}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-black/5 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-5 flex max-w-xs justify-center gap-2">
            {accents.slice(0, 3).map((color) => (
              <div key={color} className="h-20 w-16 rounded-xl bg-[#f6f7fb] p-2">
                <div className="mb-2 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <div className="space-y-1.5">
                  <div className="h-6 rounded-md bg-white shadow-sm" />
                  <div className="h-6 rounded-md bg-white/70 shadow-sm" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-base font-bold text-ink">Create your first board</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
            Projects come with kanban stages ready so you can assign work immediately.
          </p>
          <Button type="button" onClick={() => setOpen(true)} className="mt-5">
            New project
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/5 bg-[#f6f7fb] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            <span>Project</span>
            <span className="hidden sm:block">Stages</span>
            <span>Actions</span>
          </div>
          <ul className="divide-y divide-black/5">
            {projects.map((project, index) => (
              <li
                key={project.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-4 transition hover:bg-[#fafbff]"
              >
                <Link to={`/projects/${project.id}`} className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accents[index % accents.length] }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {project.name}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">
                      {project.description || 'No description'}
                    </span>
                  </span>
                </Link>
                <div className="hidden items-center gap-1 sm:flex">
                  {(project.stages || []).slice(0, 3).map((stage, i) => (
                    <span
                      key={stage.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize text-white"
                      style={{ backgroundColor: accents[i % accents.length] }}
                    >
                      {stage.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-xs font-semibold text-[#0073ea] hover:underline"
                  >
                    Open
                  </Link>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="px-0"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && (
        <Modal
          title="Create project"
          subtitle="Todo, in progress, and done stages are added automatically."
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                className="border-transparent bg-[#ececec] text-ink hover:bg-[#e2e2e2]"
              >
                Cancel
              </Button>
              <Button type="submit" form="create-project" variant="ink" disabled={creating}>
                {creating ? 'Creating…' : 'Create'}
              </Button>
            </>
          }
        >
          <form id="create-project" onSubmit={handleCreate} className="space-y-5">
            <ModalSection label="Default stages">
              <div className="flex gap-2">
                {['#fdab3d', '#0073ea', '#00c875'].map((color, i) => (
                  <div
                    key={color}
                    className="flex flex-1 items-center gap-2 rounded-xl border border-black/[0.06] bg-[#f6f6f6] px-3 py-2.5"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-semibold text-ink">
                      {['Todo', 'In progress', 'Done'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </ModalSection>

            <ModalSection label="Project details">
              <div className="space-y-3">
                <div>
                  <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-ink">
                    Name
                  </label>
                  <input
                    id="project-name"
                    required
                    placeholder="e.g. Website redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={modalFieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="project-desc" className="mb-1.5 block text-sm font-medium text-ink">
                    Description
                    <span className="ml-1 font-normal text-black/40">(optional)</span>
                  </label>
                  <textarea
                    id="project-desc"
                    rows={3}
                    placeholder="What is this board for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${modalFieldClass} resize-none`}
                  />
                </div>
              </div>
            </ModalSection>
          </form>
        </Modal>
      )}
    </div>
  )
}
