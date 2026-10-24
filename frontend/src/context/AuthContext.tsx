import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AuthUser } from '../types'
import {
  api,
  getErrorMessage,
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
} from '../store/api'
import { logout as logoutAction, setCredentials } from '../store/authSlice'
import type { RootState } from '../store'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
  isStaff: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(normalized)) as {
      id: number
      name: string
      email: string
      role: string
    }
    return {
      id: claims.id,
      name: claims.name,
      email: claims.email,
      role: claims.role,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.auth.token)
  const [loginMutation] = useLoginMutation()
  const [registerMutation] = useRegisterMutation()

  const {
    data: me,
    isLoading,
    isFetching,
    isError,
  } = useGetMeQuery(undefined, { skip: !token })

  const claims = token ? decodeToken(token) : null
  const user: AuthUser | null = me ?? claims

  const loading = Boolean(token) && (isLoading || isFetching) && !user && !isError

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'admin' || user?.role === 'manager',
      async login(email, password) {
        try {
          const data = await loginMutation({ email, password }).unwrap()
          dispatch(setCredentials({ token: data.access_token }))
        } catch (error) {
          throw new Error(getErrorMessage(error))
        }
      },
      async register(name, email, password) {
        try {
          await registerMutation({ name, email, password }).unwrap()
          const data = await loginMutation({ email, password }).unwrap()
          dispatch(setCredentials({ token: data.access_token }))
        } catch (error) {
          throw new Error(getErrorMessage(error))
        }
      },
      logout() {
        dispatch(logoutAction())
        dispatch(api.util.resetApiState())
      },
    }),
    [token, user, loading, loginMutation, registerMutation, dispatch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
