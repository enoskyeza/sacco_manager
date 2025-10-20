import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api';
import type { MemberFilters, CreateMemberRequest, UpdateMemberRequest } from '../types';
import { useSacco } from './useSacco';

/**
 * Hook to fetch all members
 */
export const useMembers = (filters?: MemberFilters) => {
  const { currentSacco } = useSacco();

  const query = useQuery({
    queryKey: ['members', currentSacco?.id, filters],
    queryFn: () => membersApi.getMembers(currentSacco!.id, filters),
    enabled: !!currentSacco,
  });

  // API already extracts results from pagination, no need to access .results again
  return {
    ...query,
    data: query.data || [],
  };
};

export const useMember = (memberId: number) => {
  const { currentSacco } = useSacco();

  return useQuery({
    queryKey: ['member', currentSacco?.id, memberId],
    queryFn: () => membersApi.getMember(currentSacco!.id, memberId),
    enabled: !!currentSacco && !!memberId,
  });
};

export const useCreateMember = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberRequest) => 
      membersApi.createMember(currentSacco!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentSacco?.id] });
    },
  });
};

export const useUpdateMember = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: number; data: UpdateMemberRequest }) =>
      membersApi.updateMember(currentSacco!.id, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['member', currentSacco?.id, variables.memberId] });
    },
  });
};

export const useDeleteMember = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) =>
      membersApi.deleteMember(currentSacco!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentSacco?.id] });
    },
  });
};
