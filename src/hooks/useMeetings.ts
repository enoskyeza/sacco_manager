import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../api';
import { useSacco } from './useSacco';
import type { MeetingFilters, CreateMeetingRequest, UpdateMeetingRequest, CreateContributionRequest } from '../types';

/**
 * Hook to fetch all meetings
 */
export const useMeetings = (filters?: MeetingFilters) => {
  const { currentSacco } = useSacco();

  return useQuery({
    queryKey: ['meetings', currentSacco?.id, filters],
    queryFn: () => meetingsApi.getMeetings(currentSacco!.id, filters),
    enabled: !!currentSacco,
  });
};

/**
 * Hook to fetch a single meeting
 */
export const useMeeting = (meetingId: number) => {
  return useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingsApi.getMeeting(meetingId),
    enabled: !!meetingId,
  });
};

/**
 * Hook to fetch meeting contributions
 */
export const useMeetingContributions = (meetingId: number) => {
  return useQuery({
    queryKey: ['meeting-contributions', meetingId],
    queryFn: () => meetingsApi.getContributions(meetingId),
    enabled: !!meetingId,
  });
};

/**
 * Hook to fetch cash round schedule
 */
export const useCashRoundSchedule = () => {
  const { currentSacco } = useSacco();

  return useQuery({
    queryKey: ['cash-round-schedule', currentSacco?.id],
    queryFn: () => meetingsApi.getCashRoundSchedule(currentSacco!.id),
    enabled: !!currentSacco,
  });
};

/**
 * Hook to create a new meeting
 */
export const useCreateMeeting = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingRequest) =>
      meetingsApi.createMeeting({ ...data, sacco: currentSacco!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

/**
 * Hook to update a meeting
 */
export const useUpdateMeeting = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: number; data: UpdateMeetingRequest }) =>
      meetingsApi.updateMeeting(meetingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

/**
 * Hooks to manage meeting contributions
 */
export const useCreateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContributionRequest) => meetingsApi.createContribution(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-contributions', variables.meeting] });
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.meeting] });
    },
  });
};

export const useUpdateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      contributionId: number;
      meetingId: number;
      data: Partial<CreateContributionRequest>;
    }) => meetingsApi.updateContribution(variables.contributionId, variables.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-contributions', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.meetingId] });
    },
  });
};

export const useDeleteContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contributionId, meetingId }: { contributionId: number; meetingId: number }) =>
      meetingsApi.deleteContribution(contributionId).then(() => ({ meetingId })),
    onSuccess: ({ meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-contributions', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
    },
  });
};

/**
 * Hook to mark a member as defaulter for a meeting
 */
export const useRecordDefaulter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      meetingId: number;
      memberId: number;
      amount?: string;
      notes?: string;
    }) =>
      meetingsApi.recordDefaulter(variables.meetingId, {
        member_id: variables.memberId,
        amount: variables.amount,
        notes: variables.notes,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-contributions', variables.meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.meetingId] });
    },
  });
};

/**
 * Hook to finalize a meeting
 */
export const useFinalizeMeeting = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: number) => meetingsApi.finalizeMeeting(meetingId),
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedule', currentSacco?.id] });
    },
  });
};

/**
 * Hook to reset a finalized meeting
 */
export const useResetMeeting = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: number) => meetingsApi.resetMeeting(meetingId),
    onSuccess: (_, meetingId) => {
      queryClient.invalidateQueries({ queryKey: ['meetings', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meeting-contributions', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['meeting-entries', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedule', currentSacco?.id] });
    },
  });
};
