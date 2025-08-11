import { DatabaseOperations } from './operations'
import { 
  User, 
  Project, 
  ProjectMember, 
  TestSuite, 
  TestScenario, 
  TestExecution, 
  Attachment, 
  ExecutionComment 
} from '@/types'

export const UserModel = new DatabaseOperations<User>('user')
export const ProjectModel = new DatabaseOperations<Project>('project')
export const ProjectMemberModel = new DatabaseOperations<ProjectMember>('projectMember')
export const TestSuiteModel = new DatabaseOperations<TestSuite>('testSuite')
export const TestScenarioModel = new DatabaseOperations<TestScenario>('testScenario')
export const TestExecutionModel = new DatabaseOperations<TestExecution>('testExecution')
export const AttachmentModel = new DatabaseOperations<Attachment>('attachment')
export const ExecutionCommentModel = new DatabaseOperations<ExecutionComment>('executionComment')