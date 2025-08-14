import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scenariosApi, CreateScenarioData, UpdateScenarioData } from '@/lib/api'
import { SUITE_KEYS } from './useSuites'

export const SCENARIO_KEYS = {
  all: ['scenarios'] as const,
  lists: () => [...SCENARIO_KEYS.all, 'list'] as const,
  list: (suiteId: number) => [...SCENARIO_KEYS.lists(), { suiteId }] as const,
  details: () => [...SCENARIO_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...SCENARIO_KEYS.details(), id] as const,
  history: (id: number) => [...SCENARIO_KEYS.detail(id), 'history'] as const,
  stats: (id: number) => [...SCENARIO_KEYS.detail(id), 'stats'] as const,
}

export function useSuiteScenarios(suiteId: number) {
  return useQuery({
    queryKey: SCENARIO_KEYS.list(suiteId),
    queryFn: () => scenariosApi.getSuiteScenarios(suiteId),
    enabled: !!suiteId,
  })
}

export function useScenario(id: number) {
  return useQuery({
    queryKey: SCENARIO_KEYS.detail(id),
    queryFn: () => scenariosApi.getScenario(id),
    enabled: !!id,
  })
}

export function useScenarioHistory(id: number) {
  return useQuery({
    queryKey: SCENARIO_KEYS.history(id),
    queryFn: () => scenariosApi.getScenarioHistory(id),
    enabled: !!id,
  })
}

export function useScenarioStats(id: number) {
  return useQuery({
    queryKey: SCENARIO_KEYS.stats(id),
    queryFn: () => scenariosApi.getScenarioStats(id),
    enabled: !!id,
  })
}

export function useCreateScenario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ suiteId, data }: { suiteId: number; data: CreateScenarioData }) =>
      scenariosApi.createScenario(suiteId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.list(variables.suiteId) })
    },
  })
}

export function useUpdateScenario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateScenarioData }) =>
      scenariosApi.updateScenario(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.detail(variables.id) })
      if (data) {
        queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.list(data.suiteId) })
      }
    },
  })
}

export function useDeleteScenario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: scenariosApi.deleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    },
  })
}

export function useDuplicateScenario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: scenariosApi.duplicateScenario,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.list(data.suiteId) })
      }
    },
  })
}