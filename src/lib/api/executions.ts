import { apiClient } from './client'
import { TestExecution, ExecutionComment } from '@/lib/types'

export interface CreateExecutionData {
  scenarioId: number
  notes?: string
  testData?: string
}

export interface UpdateExecutionData {
  status?: string
  notes?: string
  testData?: string
  completedAt?: string
}

export interface CreateCommentData {
  comment: string
}

export const executionsApi = {
  async getScenarioExecutions(scenarioId: number): Promise<TestExecution[]> {
    return await apiClient.get<TestExecution[]>(`/cenarios/${scenarioId}/execucoes`)
  },

  async getExecution(id: number): Promise<TestExecution> {
    return await apiClient.get<TestExecution>(`/execucoes/${id}`)
  },

  async createExecution(data: CreateExecutionData): Promise<TestExecution> {
    return await apiClient.post<TestExecution>('/execucoes', data)
  },

  async updateExecution(id: number, data: UpdateExecutionData): Promise<TestExecution> {
    return await apiClient.put<TestExecution>(`/execucoes/${id}`, data)
  },

  async deleteExecution(id: number): Promise<void> {
    await apiClient.delete(`/execucoes/${id}`)
  },

  async retryExecution(id: number): Promise<TestExecution> {
    return await apiClient.post<TestExecution>(`/execucoes/${id}/retry`)
  },

  async getExecutionStats(id: number): Promise<any> {
    return await apiClient.get<any>(`/execucoes/${id}/stats`)
  },

  async getExecutionComments(id: number): Promise<ExecutionComment[]> {
    return await apiClient.get<ExecutionComment[]>(`/execucoes/${id}/comentarios`)
  },

  async addExecutionComment(id: number, data: CreateCommentData): Promise<ExecutionComment> {
    return await apiClient.post<ExecutionComment>(`/execucoes/${id}/comentarios`, data)
  },

  async uploadExecutionFile(id: number, file: File): Promise<any> {
    return await apiClient.uploadFile(`/execucoes/${id}/attachments`, file)
  }
}