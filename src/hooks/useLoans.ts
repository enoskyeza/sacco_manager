import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi } from '../api';
import { useSacco } from './useSacco';
import type {
  LoanFilters,
  CreateLoanRequest,
  UpdateLoanRequest,
  CreateLoanPaymentRequest,
} from '../types';

/**
 * Fetch all loans for the current SACCO with optional filters
 */
export const useLoans = (filters?: LoanFilters) => {
  const { currentSacco } = useSacco();

  return useQuery({
    queryKey: ['loans', currentSacco?.id, filters],
    queryFn: () => loansApi.getLoans(currentSacco!.id, filters),
    enabled: !!currentSacco,
  });
};

/**
 * Fetch a single loan by ID
 */
export const useLoan = (loanId: number) => {
  return useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => loansApi.getLoan(loanId),
    enabled: !!loanId,
  });
};

/**
 * Fetch loan payments for a given loan
 */
export const useLoanPayments = (loanId: number) => {
  return useQuery({
    queryKey: ['loan-payments', loanId],
    queryFn: () => loansApi.getLoanPayments(loanId),
    enabled: !!loanId,
  });
};

/**
 * Create a new loan application
 */
export const useCreateLoan = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateLoanRequest, 'sacco'>) =>
      loansApi.createLoan({ ...data, sacco: currentSacco!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

/**
 * Update an existing loan
 */
export const useUpdateLoan = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: number; data: UpdateLoanRequest }) =>
      loansApi.updateLoan(loanId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['loan', variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

/**
 * Approve a loan
 */
export const useApproveLoan = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: number) => loansApi.approveLoan(loanId),
    onSuccess: (_, loanId) => {
      queryClient.invalidateQueries({ queryKey: ['loans', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

/**
 * Disburse a loan
 */
export const useDisburseLoan = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, disbursementDate }: { loanId: number; disbursementDate: string }) =>
      loansApi.disburseLoan(loanId, disbursementDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['loan', variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};

/**
 * Record a loan payment
 */
export const useCreateLoanPayment = () => {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanPaymentRequest) => loansApi.createLoanPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loan-payments', variables.loan] });
      queryClient.invalidateQueries({ queryKey: ['loan', variables.loan] });
      queryClient.invalidateQueries({ queryKey: ['loans', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics', currentSacco?.id] });
    },
  });
};
