import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi, CreateProjectData, UpdateProjectData, AddMemberData } from '@/lib/api'

export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROJECT_KEYS.lists(), { filters }] as const,
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROJECT_KEYS.details(), id] as const,
  members: (projectId: number) => [...PROJECT_KEYS.detail(projectId), 'members'] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.lists(),
    queryFn: projectsApi.getProjects,
    enabled: typeof window !== 'undefined', // Só executar no cliente
    retry: (failureCount, error: any) => {
      // Se der 401 (não autenticado), não tentar novamente
      if (error?.message?.includes('401') || error?.message?.includes('Token')) {
        return false
      }
      return failureCount < 3
    }
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
  })
}

export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: PROJECT_KEYS.members(projectId),
    queryFn: () => projectsApi.getProjectMembers(projectId),
    enabled: !!projectId,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
      projectsApi.updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.id) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() })
    },
  })
}

export function useAddProjectMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: AddMemberData }) =>
      projectsApi.addProjectMember(projectId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.members(variables.projectId) })
    },
  })
}

export function useUpdateProjectMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: number; userId: number; role: string }) =>
      projectsApi.updateProjectMember(projectId, userId, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.members(variables.projectId) })
    },
  })
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: number; userId: number }) =>
      projectsApi.removeProjectMember(projectId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.members(variables.projectId) })
    },
  })
}