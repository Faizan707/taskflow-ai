import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type {
  AiChatRequest,
  AiChatResponse,
  Project,
  ProjectCreate,
  Stage,
  Task,
  TaskCreate,
  TokenResponse,
  User,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as FetchBaseQueryError).data as
      | { detail?: string | Array<{ msg: string }> }
      | undefined
    const detail = data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ')
  }
  return 'Request failed'
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Me', 'Projects', 'Project', 'Tasks', 'Users', 'Assignees'],
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, { email: string; password: string }>({
      query: ({ email, password }) => {
        const body = new URLSearchParams()
        body.append('username', email)
        body.append('password', password)
        return {
          url: '/api/login',
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      },
    }),

    register: builder.mutation<User, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: '/api/create-users',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => '/api/me',
      providesTags: ['Me'],
    }),

    getProjects: builder.query<Project[], void>({
      query: () => '/api/projects',
      providesTags: ['Projects'],
    }),

    getProject: builder.query<Project, string | number>({
      query: (id) => `/api/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Project', id }],
    }),

    createProject: builder.mutation<Project, ProjectCreate>({
      query: (body) => ({
        url: '/api/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),

    updateProject: builder.mutation<
      Project,
      { id: number; name?: string; description?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/projects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => ['Projects', { type: 'Project', id }],
    }),

    deleteProject: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects', 'Tasks'],
    }),

    addStage: builder.mutation<Stage, { projectId: string | number; name: string }>({
      query: ({ projectId, name }) => ({
        url: `/api/projects/${projectId}/stages`,
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        'Projects',
        { type: 'Project', id: projectId },
      ],
    }),

    getTasks: builder.query<Task[], string | number | void>({
      query: (projectId) =>
        projectId ? `/api/tasks?project_id=${projectId}` : '/api/tasks',
      providesTags: ['Tasks'],
    }),

    createTask: builder.mutation<Task, TaskCreate>({
      query: (body) => ({
        url: '/api/create_task',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),

    updateTask: builder.mutation<
      Task,
      {
        id: number
        title?: string
        description?: string
        stage_id?: number
        assignee_id?: number
        priority?: 'low' | 'medium' | 'high'
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/tasks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),

    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),

    moveTaskStage: builder.mutation<Task, { id: number; stageId: number }>({
      query: ({ id, stageId }) => ({
        url: `/api/tasks/${id}/stage`,
        method: 'PATCH',
        body: { stage_id: stageId },
      }),
      invalidatesTags: ['Tasks'],
    }),

    getAssignees: builder.query<User[], void>({
      query: () => '/api/assignees',
      providesTags: ['Assignees'],
    }),

    getUsers: builder.query<User[], void>({
      query: () => '/api/users',
      providesTags: ['Users'],
    }),

    updateUserRole: builder.mutation<User, { userId: number; role: 'manager' | 'user' }>({
      query: ({ userId, role }) => ({
        url: `/api/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users', 'Assignees'],
    }),

    aiChat: builder.mutation<AiChatResponse, AiChatRequest>({
      query: (body) => ({
        url: '/api/ai/chat',
        method: 'POST',
        body,
      }),
      // After AI creates/assigns things, refresh lists
      invalidatesTags: ['Projects', 'Project', 'Tasks', 'Assignees'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddStageMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskStageMutation,
  useGetAssigneesQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useAiChatMutation,
} = api
