import { apiClient } from './client'
import { TestScenario } from '@/lib/types'

export interface CreateScenarioData {
  name: string
  preconditions?: string
  steps?: string
  expectedResult?: string
  assignedTo?: number
  priority?: string
}

export interface UpdateScenarioData {
  name?: string
  preconditions?: string
  steps?: string
  expectedResult?: string
  assignedTo?: number
  priority?: string
  status?: string
  scenarioOrder?: number
}

export const scenariosApi = {
  async getSuiteScenarios(suiteId: number): Promise<TestScenario[]> {
    return await apiClient.get<TestScenario[]>(`/suites/${suiteId}/cenarios`)
  },

  async getScenario(id: number): Promise<TestScenario> {
    return await apiClient.get<TestScenario>(`/cenarios/${id}`)
  },

  async createScenario(suiteId: number, data: CreateScenarioData): Promise<TestScenario> {
    return await apiClient.post<TestScenario>('/cenarios', {
      ...data,
      suiteId
    })
  },

  async updateScenario(id: number, data: UpdateScenarioData): Promise<TestScenario> {
    return await apiClient.put<TestScenario>(`/cenarios/${id}`, data)
  },

  async deleteScenario(id: number): Promise<void> {
    await apiClient.delete(`/cenarios/${id}`)
  },

  async duplicateScenario(id: number): Promise<TestScenario> {
    return await apiClient.post<TestScenario>(`/cenarios/${id}/duplicate`)
  },

  async getScenarioHistory(id: number): Promise<any[]> {
    return await apiClient.get<any[]>(`/cenarios/${id}/history`)
  },

  async getScenarioStats(id: number): Promise<any> {
    return await apiClient.get<any>(`/cenarios/${id}/stats`)
  }
}