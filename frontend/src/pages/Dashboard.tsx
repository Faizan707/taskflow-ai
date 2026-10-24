import { Link } from 'react-router-dom'
import { buttonClassName } from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, useGetProjectsQuery, useGetTasksQuery } from '../store/api'

const accents = ['#fdab3d', '#0073ea', '#00c875', '#ff7575']

export default function Dashboard() {
  const { user, isStaff } = useAuth()
  const {
    data: projects = [],
    error: projectsError,
  } = useGetProjectsQuery()
  const {
    data: tasks = [],
    error: tasksError,
  } = useGetTasksQuery()

  const error = projectsError || tasksError
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="animate-rise space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Good day, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            {isStaff
              ? 'Full visibility across projects and tasks for your team.'
              : 'Your boards and assigned work, ready when you are.'}
          </p>
        </div>
        <Link to="/projects" className={buttonClassName()}>
          + New project
        </Link>
      </section>

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
          {getErrorMessage(error)}
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Projects" value={projects.length} accent="#0073ea" hint="Active boards" />
        <Stat label="Tasks" value={tasks.length} accent="#00c875" hint="Across your view" />
        <Stat
          label="Role"
          value={user?.role || '—'}
          accent="#fdab3d"
          hint="Access level"
          capitalize
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/projects"
          className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm transition hover:border-[#0073ea]/30 hover:shadow-md"
        >
          <div>
            <p className="text-sm font-bold text-ink">Open boards</p>
            <p className="mt-1 text-xs text-ink-soft">Jump into project kanban views</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0073ea]/10 text-[#0073ea] transition group-hover:bg-[#0073ea] group-hover:text-white">
            →
          </span>
        </Link>
        <Link
          to="/projects"
          className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm transition hover:border-[#00c875]/40 hover:shadow-md"
        >
          <div>
            <p className="text-sm font-bold text-ink">Create project</p>
            <p className="mt-1 text-xs text-ink-soft">Starts with todo · in progress · done</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#00c875]/10 text-[#00854d] transition group-hover:bg-[#00c875] group-hover:text-white">
            +
          </span>
        </Link>
      </section>

      <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-ink">Recent projects</h2>
            <p className="text-xs text-ink-soft">Boards you can open right now</p>
          </div>
          <Link to="/projects" className="text-xs font-semibold text-[#0073ea] hover:underline">
            View all
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-5 flex max-w-xs justify-center gap-2">
              {['#fdab3d', '#0073ea', '#00c875'].map((color) => (
                <div key={color} className="h-16 w-14 rounded-lg bg-[#f6f7fb] p-1.5 shadow-sm">
                  <div className="mb-1.5 h-1 rounded-full" style={{ backgroundColor: color }} />
                  <div className="space-y-1">
                    <div className="h-2 rounded bg-black/5" />
                    <div className="h-2 w-2/3 rounded bg-black/5" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-ink">No projects yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-ink-soft">
              Create a board to unlock default kanban stages and start assigning tasks.
            </p>
            <Link to="/projects" className={buttonClassName({ className: 'mt-5' })}>
              Create your first project
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-black/5">
            {projects.slice(0, 5).map((project, index) => (
              <li key={project.id}>
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-[#f6f7fb]"
                >
                  <span
                    className="h-8 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accents[index % accents.length] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{project.name}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <div className="hidden items-center gap-1.5 sm:flex">
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
                  <span className="text-xs font-medium text-ink-soft">
                    {project.stages?.length || 0} stages
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
  hint,
  capitalize = false,
}: {
  label: string
  value: string | number
  accent: string
  hint: string
  capitalize?: boolean
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      </div>
      <p
        className={[
          'mt-2 text-3xl font-bold tracking-tight text-ink',
          capitalize ? 'capitalize' : '',
        ].join(' ')}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
    </div>
  )
}
