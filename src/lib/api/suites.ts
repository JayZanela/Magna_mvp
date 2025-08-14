import { apiClient } from './client'
import { TestSuite } from '@/lib/types'

export interface CreateSuiteData {
  name: string
  description?: string
  parentId?: number
}

export interface UpdateSuiteData {
  name?: string
  description?: string
  suiteOrder?: number
}

export interface MoveSuiteData {
  parentId?: number
  newOrder?: number
}

interface TestSuiteReturn {
  projectId: number
  total: number
  suites: TestSuite[]
}

export const suitesApi = {
  async getProjectSuites(projectId: number): Promise<TestSuiteReturn> {
    return await apiClient.get<TestSuiteReturn>(`/projects/${projectId}/suites`)
  },

  async getSuite(id: number): Promise<TestSuite> {
    return await apiClient.get<TestSuite>(`/suites/${id}`)
  },

  async createSuite(
    projectId: number,
    data: CreateSuiteData
  ): Promise<TestSuite> {
    return await apiClient.post<TestSuite>(
      `/projects/${projectId}/suites`,
      data
    )
  },

  async updateSuite(id: number, data: UpdateSuiteData): Promise<TestSuite> {
    return await apiClient.put<TestSuite>(`/suites/${id}`, data)
  },

  async deleteSuite(id: number): Promise<void> {
    await apiClient.delete(`/suites/${id}`)
  },

  async moveSuite(id: number, data: MoveSuiteData): Promise<TestSuite> {
    return await apiClient.put<TestSuite>(`/suites/${id}/move`, data)
  },

  async getSuiteChildren(id: number): Promise<TestSuite[]> {
    return await apiClient.get<TestSuite[]>(`/suites/${id}/children`)
  },
}
