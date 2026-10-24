export type UserRole = 'admin' | 'manager' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole | string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface Stage {
  id: number
  name: string
  position: number
  project_id: number
}

export interface Project {
  id: number
  name: string
  description: string
  owner_id: number
  stages: Stage[]
}

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description: string
  priority: TaskPriority
  project_id: number
  stage_id: number
  assignee_id: number
  created_by_id: number
}

export interface ProjectCreate {
  name: string
  description?: string
}

export interface TaskCreate {
  title: string
  description?: string
  project_id: number
  stage_id: number
  assignee_id: number
  priority?: TaskPriority
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

export interface AiChatRequest {
  message: string
}

export interface AiChatResponse {
  reply: string
}

export interface AiChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}
