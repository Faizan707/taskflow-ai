import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getErrorMessage,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from '../store/api'

export default function Users() {
  const { isAdmin, user } = useAuth()
  const { data: users = [], error: listError } = useGetUsersQuery(undefined, {
    skip: !isAdmin,
  })
  const [updateUserRole, { isLoading }] = useUpdateUserRoleMutation()
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleRoleChange(userId: number, role: 'manager' | 'user') {
    setSavingId(userId)
    setError('')
    try {
      await updateUserRole({ userId, role }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSavingId(null)
    }
  }

  const displayError = error || (listError ? getErrorMessage(listError) : '')

  return (
    <div className="animate-rise space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Users</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Change roles between manager and user. Your admin role stays locked.
        </p>
      </div>

      {displayError && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-danger">
          {displayError}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1.2fr_140px] gap-3 border-b border-black/5 bg-[#f6f7fb] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
        </div>
        <ul className="divide-y divide-black/5">
          {users.map((person) => (
            <li
              key={person.id}
              className="grid grid-cols-[1fr_1.2fr_140px] items-center gap-3 px-5 py-3.5 hover:bg-[#fafbff]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0073ea]/10 text-xs font-bold text-[#0073ea]">
                  {person.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate text-sm font-semibold text-ink">{person.name}</span>
              </div>
              <span className="truncate text-sm text-ink-soft">{person.email}</span>
              <div>
                {person.id === user?.id || person.role === 'admin' ? (
                  <span className="inline-flex rounded-full bg-[#f6f7fb] px-2.5 py-1 text-xs font-semibold capitalize text-ink">
                    {person.role}
                  </span>
                ) : (
                  <select
                    value={person.role === 'manager' ? 'manager' : 'user'}
                    disabled={savingId === person.id || isLoading}
                    onChange={(e) =>
                      handleRoleChange(person.id, e.target.value as 'manager' | 'user')
                    }
                    className="w-full rounded-lg border border-black/10 bg-[#f6f7fb] px-2 py-1.5 text-xs font-semibold capitalize outline-none focus:border-[#0073ea]"
                  >
                    <option value="user">user</option>
                    <option value="manager">manager</option>
                  </select>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
