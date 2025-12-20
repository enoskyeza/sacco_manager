import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi } from '../api';
import { useSacco } from './useSacco';
import type {
  WithdrawalFilters,
  CreateWithdrawalRequest,
  WithdrawalAvailableSummary,
} from '../types';

export const useWithdrawals = (filters?: WithdrawalFilters) => {
  const { currentSacco } = useSacco();

  return useQuery({
    queryKey: ['withdrawals', currentSacco?.id, filters],
    queryFn: () => withdrawalsApi.getWithdrawals(currentSacco!.id, filters),
    enabled: !!currentSacco,
  });
};

export const useWithdrawalAvailable = (memberId?: number) => {
  const { currentSacco } = useSacco();

  return useQuery<WithdrawalAvailableSummary>({
    queryKey: ['withdrawals-available', currentSacco?.id, memberId],
    queryFn: () => withdrawalsApi.getAvailable(currentSacco!.id, memberId),
    enabled: !!currentSacco,
  });
};

export const useCreateWithdrawal = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateWithdrawalRequest, 'sacco'>) =>
      withdrawalsApi.createWithdrawal({ ...data, sacco: currentSacco!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals-available', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

export const useApproveWithdrawal = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (withdrawalId: number) => withdrawalsApi.approveWithdrawal(withdrawalId),
    onSuccess: (_, withdrawalId) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal', withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals-available', currentSacco?.id] });
    },
  });
};

export const useRejectWithdrawal = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, reason }: { withdrawalId: number; reason: string }) =>
      withdrawalsApi.rejectWithdrawal(withdrawalId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal', variables.withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals-available', currentSacco?.id] });
    },
  });
};

export const useDisburseWithdrawal = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ withdrawalId, disbursementDate }: { withdrawalId: number; disbursementDate: string }) =>
      withdrawalsApi.disburseWithdrawal(withdrawalId, disbursementDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal', variables.withdrawalId] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals-available', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};
