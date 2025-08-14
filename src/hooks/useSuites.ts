import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suitesApi, CreateSuiteData, UpdateSuiteData, MoveSuiteData } from '@/lib/api'
import { PROJECT_KEYS } from './useProjects'

export const SUITE_KEYS = {
  all: ['suites'] as const,
  lists: () => [...SUITE_KEYS.all, 'list'] as const,
  list: (projectId: number) => [...SUITE_KEYS.lists(), { projectId }] as const,
  details: () => [...SUITE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...SUITE_KEYS.details(), id] as const,
  children: (id: number) => [...SUITE_KEYS.detail(id), 'children'] as const,
}

export function useProjectSuites(projectId: number) {
  return useQuery({
    queryKey: SUITE_KEYS.list(projectId),
    queryFn: () => suitesApi.getProjectSuites(projectId),
    enabled: !!projectId,
  })
}

export function useSuite(id: number) {
  return useQuery({
    queryKey: SUITE_KEYS.detail(id),
    queryFn: () => suitesApi.getSuite(id),
    enabled: !!id,
  })
}

export function useSuiteChildren(id: number) {
  return useQuery({
    queryKey: SUITE_KEYS.children(id),
    queryFn: () => suitesApi.getSuiteChildren(id),
    enabled: !!id,
  })
}

export function useCreateSuite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: CreateSuiteData }) =>
      suitesApi.createSuite(projectId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUITE_KEYS.list(variables.projectId) })
      if (variables.data.parentId) {
        queryClient.invalidateQueries({ queryKey: SUITE_KEYS.children(variables.data.parentId) })
      }
    },
  })
}

export function useUpdateSuite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSuiteData }) =>
      suitesApi.updateSuite(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUITE_KEYS.detail(variables.id) })
      // Invalidate the project suites list
      queryClient.invalidateQueries({ queryKey: SUITE_KEYS.lists() })
    },
  })
}

export function useDeleteSuite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: suitesApi.deleteSuite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUITE_KEYS.lists() })
    },
  })
}

export function useMoveSuite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MoveSuiteData }) =>
      suitesApi.moveSuite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUITE_KEYS.lists() })
    },
  })
}