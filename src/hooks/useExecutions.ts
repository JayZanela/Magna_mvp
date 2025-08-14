import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { executionsApi, CreateExecutionData, UpdateExecutionData, CreateCommentData } from '@/lib/api'
import { SCENARIO_KEYS } from './useScenarios'

export const EXECUTION_KEYS = {
  all: ['executions'] as const,
  lists: () => [...EXECUTION_KEYS.all, 'list'] as const,
  list: (scenarioId: number) => [...EXECUTION_KEYS.lists(), { scenarioId }] as const,
  details: () => [...EXECUTION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EXECUTION_KEYS.details(), id] as const,
  stats: (id: number) => [...EXECUTION_KEYS.detail(id), 'stats'] as const,
  comments: (id: number) => [...EXECUTION_KEYS.detail(id), 'comments'] as const,
}

export function useScenarioExecutions(scenarioId: number) {
  return useQuery({
    queryKey: EXECUTION_KEYS.list(scenarioId),
    queryFn: () => executionsApi.getScenarioExecutions(scenarioId),
    enabled: !!scenarioId,
  })
}

export function useExecution(id: number) {
  return useQuery({
    queryKey: EXECUTION_KEYS.detail(id),
    queryFn: () => executionsApi.getExecution(id),
    enabled: !!id,
  })
}

export function useExecutionStats(id: number) {
  return useQuery({
    queryKey: EXECUTION_KEYS.stats(id),
    queryFn: () => executionsApi.getExecutionStats(id),
    enabled: !!id,
  })
}

export function useExecutionComments(id: number) {
  return useQuery({
    queryKey: EXECUTION_KEYS.comments(id),
    queryFn: () => executionsApi.getExecutionComments(id),
    enabled: !!id,
  })
}

export function useCreateExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: executionsApi.createExecution,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.list(data.scenarioId) })
        queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.detail(data.scenarioId) })
      }
    },
  })
}

export function useUpdateExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExecutionData }) =>
      executionsApi.updateExecution(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.detail(variables.id) })
      if (data) {
        queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.list(data.scenarioId) })
        queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.detail(data.scenarioId) })
      }
    },
  })
}

export function useDeleteExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: executionsApi.deleteExecution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.lists() })
    },
  })
}

export function useRetryExecution() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: executionsApi.retryExecution,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.list(data.scenarioId) })
        queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.detail(data.scenarioId) })
      }
    },
  })
}

export function useAddExecutionComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCommentData }) =>
      executionsApi.addExecutionComment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.comments(variables.id) })
    },
  })
}

export function useUploadExecutionFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      executionsApi.uploadExecutionFile(id, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: EXECUTION_KEYS.detail(variables.id) })
    },
  })
}