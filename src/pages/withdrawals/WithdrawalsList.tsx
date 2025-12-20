import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownCircle, Filter, Plus, UserCircle2 } from 'lucide-react';

import { useCurrentMember } from '../../hooks/useCurrentMember';
import { useMembers } from '../../hooks/useMembers';
import {
  useWithdrawals,
  useWithdrawalAvailable,
  useCreateWithdrawal,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useDisburseWithdrawal,
} from '../../hooks/useWithdrawals';

import type {
  WithdrawalFilters,
  WithdrawalStatus,
  SaccoWithdrawal,
} from '../../types';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  TextArea,
  WithdrawalStatusBadge,
} from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/format';

interface RequestFormState {
  amount: string;
  reason: string;
  notes: string;
}

export default function WithdrawalsList() {
  const { data: currentMember, isLoading: currentMemberLoading } = useCurrentMember();
  const isSecretary = !!(
    currentMember && (currentMember.role?.toLowerCase().includes('secretary') ?? false)
  );

  const { data: allMembers = [] } = useMembers({ status: 'active' });

  const [viewAllMembers, setViewAllMembers] = useState(false);
  const [memberFilter, setMemberFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | ''>('');

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState<RequestFormState>({
    amount: '',
    reason: '',
    notes: '',
  });

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<SaccoWithdrawal | null>(null);

  const withdrawalFilters: WithdrawalFilters | undefined = useMemo(() => {
    const filters: WithdrawalFilters = {};

    if (!isSecretary || !viewAllMembers) {
      if (currentMember) {
        filters.member = currentMember.id;
      }
    } else if (memberFilter !== 'all') {
      filters.member = memberFilter as number;
    }

    if (statusFilter) {
      filters.status = statusFilter;
    }

    return filters;
  }, [currentMember, isSecretary, viewAllMembers, memberFilter, statusFilter]);

  const {
    data: withdrawals = [],
    isLoading: withdrawalsLoading,
    error: withdrawalsError,
    refetch: refetchWithdrawals,
  } = useWithdrawals(withdrawalFilters);

  const availableQuery = useWithdrawalAvailable(currentMember?.id);

  const createWithdrawal = useCreateWithdrawal();
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();
  const disburseWithdrawal = useDisburseWithdrawal();

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const totalAvailable = useMemo(() => {
    const raw = availableQuery.data?.total_available;
    const parsed = raw ? parseFloat(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [availableQuery.data?.total_available]);

  const handleOpenRequest = () => {
    setIsRequestModalOpen(true);
    availableQuery.refetch();
  };

  const handleSubmitRequest = async () => {
    if (!currentMember) return;

    const amountNum = parseFloat(requestForm.amount || '0');
    if (!amountNum || amountNum <= 0) {
      toast.error('Enter a valid withdrawal amount');
      return;
    }

    if (amountNum > totalAvailable) {
      toast.error('Requested amount exceeds your available withdrawable balance');
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        member: currentMember.id,
        amount: requestForm.amount,
        request_date: todayStr(),
        reason: requestForm.reason || undefined,
        notes: requestForm.notes || undefined,
      });

      toast.success('Withdrawal request submitted');
      setIsRequestModalOpen(false);
      setRequestForm({ amount: '', reason: '', notes: '' });
      await refetchWithdrawals();
      await availableQuery.refetch();
    } catch (error: unknown) {
      type ApiErrorResponse = {
        response?: {
          data?: {
            error?: string;
            detail?: string;
            [key: string]: unknown;
          };
        };
      };
      const err = error as ApiErrorResponse;
      const data = err.response?.data;
      const message =
        (data && (data.error as string)) ||
        (data && (data.detail as string)) ||
        (data ? JSON.stringify(data) : 'Failed to submit withdrawal request.');
      toast.error(message);
    }
  };

  const handleApprove = async (w: SaccoWithdrawal) => {
    try {
      await approveWithdrawal.mutateAsync(w.id);
      toast.success('Withdrawal approved');
      await refetchWithdrawals();
    } catch {
      toast.error('Failed to approve withdrawal');
    }
  };

  const handleOpenReject = (w: SaccoWithdrawal) => {
    setSelectedWithdrawal(w);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      await rejectWithdrawal.mutateAsync({ withdrawalId: selectedWithdrawal.id, reason: rejectReason });
      toast.success('Withdrawal rejected');
      setIsRejectModalOpen(false);
      setSelectedWithdrawal(null);
      setRejectReason('');
      await refetchWithdrawals();
    } catch {
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleDisburse = async (w: SaccoWithdrawal) => {
    try {
      await disburseWithdrawal.mutateAsync({ withdrawalId: w.id, disbursementDate: todayStr() });
      toast.success('Withdrawal disbursed');
      await refetchWithdrawals();
      await availableQuery.refetch();
    } catch {
      toast.error('Failed to disburse withdrawal');
    }
  };

  if (currentMemberLoading) {
    return <Loading message="Loading withdrawals..." />;
  }

  if (withdrawalsLoading) {
    return <Loading message="Loading withdrawals..." />;
  }

  if (withdrawalsError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading withdrawals</p>
          <p className="text-sm mt-1">{(withdrawalsError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <UserCircle2 size={16} />
            {viewAllMembers && isSecretary ? "Viewing all members' withdrawals" : 'Viewing your withdrawals'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {isSecretary && (
            <Button
              variant={viewAllMembers ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewAllMembers((prev) => !prev)}
            >
              {viewAllMembers ? 'Show My Withdrawals Only' : 'View All Members Withdrawals'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleOpenRequest}
          >
            Withdraw
          </Button>
        </div>
      </div>

      {(isSecretary && viewAllMembers) && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All members</option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter((e.target.value as WithdrawalStatus) || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Filter size={16} />}
                  onClick={() => refetchWithdrawals()}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardBody>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownCircle className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
              <p className="text-gray-500 mb-6">Start by requesting a withdrawal from your withdrawable passbook sections.</p>
              <Button variant="primary" leftIcon={<Plus size={18} />} onClick={handleOpenRequest}>
                Request Withdrawal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isSecretary && viewAllMembers && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {isSecretary && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      {isSecretary && viewAllMembers && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {w.member_name || `Member #${w.member}`}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {w.withdrawal_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(w.request_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(w.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <WithdrawalStatusBadge status={w.status} />
                      </td>
                      {isSecretary && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-2">
                            {w.status === 'pending' && (
                              <>
                                <Button size="sm" variant="primary" onClick={() => handleApprove(w)}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleOpenReject(w)}>
                                  Reject
                                </Button>
                              </>
                            )}
                            {w.status === 'approved' && (
                              <Button size="sm" variant="secondary" onClick={() => handleDisburse(w)}>
                                Disburse
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Withdrawal"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitRequest}
              isLoading={createWithdrawal.isPending}
            >
              Submit Request
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-800 font-medium">Available to withdraw</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">
              {formatCurrency(availableQuery.data?.total_available || '0')}
            </p>
            <p className="text-xs text-indigo-700 mt-1">
              Based on balances in withdrawable passbook sections (minus reserved amounts).
            </p>
          </div>

          <Input
            label="Amount"
            type="number"
            value={requestForm.amount}
            onChange={(e) => setRequestForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="0"
            helperText={totalAvailable > 0 ? `Max: ${formatCurrency(totalAvailable)}` : undefined}
          />

          <Input
            label="Reason (optional)"
            value={requestForm.reason}
            onChange={(e) => setRequestForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="e.g., School fees"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <TextArea
              value={requestForm.notes}
              onChange={(e) => setRequestForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any extra details..."
              rows={3}
            />
          </div>

          {availableQuery.data?.sections?.length ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Withdrawable sections</h3>
              <div className="space-y-2">
                {availableQuery.data.sections.map((s) => (
                  <div key={s.section_id} className="flex items-center justify-between text-sm border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-gray-900 truncate">{s.section_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-medium">{formatCurrency(s.available)}</div>
                      <div className="text-xs text-gray-500">available</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={selectedWithdrawal ? `Reject ${selectedWithdrawal.withdrawal_number}` : 'Reject Withdrawal'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              isLoading={rejectWithdrawal.isPending}
            >
              Reject
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Provide a reason (optional).</p>
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
