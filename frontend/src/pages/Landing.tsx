import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button, buttonClassName } from '../components/Button'
import { useAuth } from '../context/AuthContext'

type FeatureId = 'plan' | 'collab' | 'track' | 'report'

const modes = [
  'Project management',
  'Task management',
  'Client projects',
  'Team operations',
]

const features: Array<{ id: FeatureId; title: string; body: string }> = [
  {
    id: 'plan',
    title: 'Plan & assign',
    body: 'Create projects, set kanban stages, and assign the right person in one flow — including yourself.',
  },
  {
    id: 'collab',
    title: 'Collaborate & execute',
    body: 'Managers and admins see the full board. Teammates stay focused on work assigned to them.',
  },
  {
    id: 'track',
    title: 'Track & manage',
    body: 'Move cards across todo, in progress, and done — or add custom stages for your process.',
  },
  {
    id: 'report',
    title: 'Clarity for leads',
    body: 'Role-based access keeps admins in control of users while teams keep shipping from one workspace.',
  },
]

const columns = [
  {
    name: 'Todo',
    color: 'bg-[#fdab3d]',
    tasks: ['Kickoff brief', 'Collect requirements'],
  },
  {
    name: 'In progress',
    color: 'bg-[#0073ea]',
    tasks: ['Design board', 'API integration'],
  },
  {
    name: 'Done',
    color: 'bg-[#00c875]',
    tasks: ['Launch checklist'],
  },
]

export default function Landing() {
  const { token } = useAuth()
  const [activeMode, setActiveMode] = useState(modes[0])
  const [activeFeature, setActiveFeature] = useState<FeatureId>(features[0].id)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const feature = features.find((f) => f.id === activeFeature) || features[0]

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
            TaskFlow
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className={buttonClassName({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link to="/register" className={buttonClassName({ variant: 'ink' })}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — monday-style: brand + one headline + support + CTA + product visual */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,115,234,0.08),_transparent_55%),radial-gradient(ellipse_at_80%_20%,_rgba(0,200,117,0.1),_transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <div className="animate-rise">
            <p className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              TaskFlow
            </p>
            <h1 className="mt-5 max-w-xl text-2xl font-semibold leading-snug text-ink-soft sm:text-3xl">
              Project management made easy for teams that actually ship.
            </h1>
            <p className="mt-4 max-w-lg text-base text-ink-soft/90">
              Run every project in one workspace — boards, stages, assignments, and roles your team
              will adopt instantly.
            </p>

            <p className="mt-8 text-sm font-semibold text-ink">Select what you want to manage:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {modes.map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={activeMode === mode ? 'ink' : 'secondary'}
                  onClick={() => setActiveMode(mode)}
                  className={[
                    'rounded-full px-3.5 py-1.5 text-sm font-medium',
                    activeMode === mode ? '' : 'border-line',
                  ].join(' ')}
                >
                  {mode}
                </Button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className={buttonClassName({ size: 'lg', className: 'px-5' })}>
                Get started
              </Link>
              <Link
                to="/login"
                className={buttonClassName({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'border-line px-5 text-ink hover:border-ink/20',
                })}
              >
                Log in
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink-soft">Free to try. No credit card needed.</p>
          </div>

          {/* Product mock board */}
          <div className="animate-rise [animation-delay:120ms]">
            <div className="rounded-3xl border border-black/5 bg-[#f6f7fb] p-4 shadow-[0_30px_80px_-40px_rgba(18,33,43,0.45)] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Board preview
                  </p>
                  <p className="font-display text-lg font-bold text-ink">{activeMode}</p>
                </div>
                <span className="rounded-full bg-[#00c875]/15 px-2.5 py-1 text-xs font-semibold text-[#00854d]">
                  Live
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {columns.map((col) => (
                  <div
                    key={col.name}
                    className="min-w-[150px] flex-1 rounded-2xl bg-white p-3 shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                      <p className="text-sm font-semibold text-ink">{col.name}</p>
                    </div>
                    <div className="space-y-2">
                      {col.tasks.map((task) => (
                        <div
                          key={task}
                          className="rounded-xl border border-black/5 bg-[#fafbff] px-3 py-2.5 text-sm text-ink"
                        >
                          {task}
                          <div className="mt-2 h-1.5 w-16 rounded-full bg-black/5" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature tabs */}
      <section className="border-y border-black/5 bg-[#f7f8fc]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4">
            {features.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={activeFeature === item.id ? 'secondary' : 'ghost'}
                onClick={() => setActiveFeature(item.id)}
                className={
                  activeFeature === item.id
                    ? 'border-transparent bg-white text-ink shadow-sm'
                    : ''
                }
              >
                {item.title}
              </Button>
            ))}
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {feature.title}
              </h2>
              <p className="mt-4 max-w-md text-lg text-ink-soft">{feature.body}</p>
              <Link to="/register" className={buttonClassName({ variant: 'ink', className: 'mt-6' })}>
                Get started
              </Link>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                {['Create project', 'Add stages', 'Assign teammates', 'Move work to done'].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#fafbff] px-4 py-3"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0073ea]/10 text-sm font-bold text-[#0073ea]">
                        {index + 1}
                      </span>
                      <span className="font-medium text-ink">{step}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Why teams choose TaskFlow
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Total visibility',
              body: 'Admins and managers see every board. Users stay on their own work.',
              accent: 'bg-[#0073ea]',
            },
            {
              title: 'Fast to adopt',
              body: 'Default stages out of the box — customize when your process needs it.',
              accent: 'bg-[#00c875]',
            },
            {
              title: 'Flexible by design',
              body: 'Assign anyone on create, move cards freely, and keep roles clean.',
              accent: 'bg-[#fdab3d]',
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <span className={`mb-4 block h-2 w-12 rounded-full ${card.accent}`} />
              <h3 className="font-display text-xl font-bold text-ink">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-black/5 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Bring clarity to every project
            </h2>
            <p className="mt-3 max-w-xl text-white/65">
              Start with a board in minutes. Invite your workflow — not another complicated tool.
            </p>
          </div>
          <Link to="/register" className={buttonClassName({ size: 'lg', className: 'px-5' })}>
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 py-6 text-center text-xs text-ink-soft">
        TaskFlow — inspired by modern work platforms like{' '}
        <a
          href="https://monday.com/ap/project-management"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ink hover:underline"
        >
          monday.com
        </a>
      </footer>
    </div>
  )
}
