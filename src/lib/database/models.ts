import { DatabaseOperations } from './operations'

export interface User {
  id: number
  email: string
  passwordHash: string
  fullName: string
  role: 'admin' | 'manager' | 'tester' | 'guest'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: number
  name: string
  description?: string
  ownerId: number
  status: 'active' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  id: number
  projectId: number
  userId: number
  role: 'manager' | 'tester' | 'viewer'
  joinedAt: Date
}

export interface TestSuite {
  id: number
  projectId: number
  parentId?: number
  name: string
  description?: string
  suiteOrder: number
  createdAt: Date
}

export interface TestScenario {
  id: number
  suiteId: number
  name: string
  preconditions?: string
  steps?: string
  expectedResult?: string
  assignedTo?: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'blocked' | 'retest'
  scenarioOrder: number
  createdBy: number
  createdAt: Date
  updatedAt: Date
}

export interface TestExecution {
  id: number
  scenarioId: number
  executorId: number
  executionRound: number
  status: 'passed' | 'failed' | 'blocked' | 'skipped'
  notes?: string
  testData?: string
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
}

export interface Attachment {
  id: number
  executionId: number
  fileName: string
  filePath: string
  fileType?: string
  fileSize?: number
  uploadedBy: number
  uploadedAt: Date
}

export interface ExecutionComment {
  id: number
  executionId: number
  userId: number
  comment: string
  createdAt: Date
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
}

export const UserModel = new DatabaseOperations<User>('user')
export const ProjectModel = new DatabaseOperations<Project>('project')
export const ProjectMemberModel = new DatabaseOperations<ProjectMember>('projectMember')
export const TestSuiteModel = new DatabaseOperations<TestSuite>('testSuite')
export const TestScenarioModel = new DatabaseOperations<TestScenario>('testScenario')
export const TestExecutionModel = new DatabaseOperations<TestExecution>('testExecution')
export const AttachmentModel = new DatabaseOperations<Attachment>('attachment')
export const ExecutionCommentModel = new DatabaseOperations<ExecutionComment>('executionComment')