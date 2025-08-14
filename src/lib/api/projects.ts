import { apiClient } from './client'
import { Project, ProjectMember, User } from '@/lib/types'

export interface CreateProjectData {
  name: string
  description?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  status?: string
}

export interface AddMemberData {
  userId: number
  role: string
}

interface projectsReturn {
  menber: number
  owned: number
  projects: Project[]
  total: number
}

export const projectsApi = {
  async getProjects(): Promise<projectsReturn> {
    return await apiClient.get<projectsReturn>('/projects')
  },

  async getProject(id: number): Promise<Project> {
    return await apiClient.get<Project>(`/projects/${id}`)
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    return await apiClient.post<Project>('/projects', data)
  },

  async updateProject(id: number, data: UpdateProjectData): Promise<Project> {
    return await apiClient.put<Project>(`/projects/${id}`, data)
  },

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return await apiClient.get<ProjectMember[]>(
      `/projects/${projectId}/members`
    )
  },

  async addProjectMember(
    projectId: number,
    data: AddMemberData
  ): Promise<ProjectMember> {
    return await apiClient.post<ProjectMember>(
      `/projects/${projectId}/members`,
      data
    )
  },

  async updateProjectMember(
    projectId: number,
    userId: number,
    role: string
  ): Promise<ProjectMember> {
    return await apiClient.put<ProjectMember>(
      `/projects/${projectId}/members/${userId}`,
      { role }
    )
  },

  async removeProjectMember(projectId: number, userId: number): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`)
  },
}
