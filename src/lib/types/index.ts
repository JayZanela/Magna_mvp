export interface User {
  id: number
  email: string
  fullName: string
  role: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface Project {
  id: number
  name: string
  description?: string
  ownerId: number
  status: string
  createdAt: string
  updatedAt: string
  owner?: User
  members?: ProjectMember[]
}

export interface ProjectMember {
  id: number
  projectId: number
  userId: number
  role: string
  joinedAt: string
  user: User
}

export interface TestSuite {
  id: number
  projectId: number
  parentId?: number
  name: string
  description?: string
  suiteOrder: number
  createdAt: string
  children?: TestSuite[]
  scenarios?: TestScenario[]
}

export interface TestScenario {
  id: number
  suiteId: number
  name: string
  preconditions?: string
  steps?: string
  expectedResult?: string
  assignedTo?: number
  priority: string
  status: string
  scenarioOrder: number
  createdBy: number
  createdAt: string
  updatedAt: string
  assignee?: User
  creator: User
  executions?: TestExecution[]
}

export interface TestExecution {
  id: number
  scenarioId: number
  executorId: number
  executionRound: number
  status: string
  notes?: string
  testData?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  executor: User
  attachments?: Attachment[]
  comments?: ExecutionComment[]
}

export interface Attachment {
  id: number
  executionId: number
  fileName: string
  filePath: string
  fileType?: string
  fileSize?: number
  uploadedBy: number
  uploadedAt: string
  uploader: User
}

export interface ExecutionComment {
  id: number
  executionId: number
  userId: number
  comment: string
  createdAt: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}