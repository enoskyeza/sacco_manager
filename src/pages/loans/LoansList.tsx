import { useMemo, useState } from 'react';
import { useCurrentMember } from '../../hooks/useCurrentMember';
import { useMembers } from '../../hooks/useMembers';
import {
  useLoans,
  useCreateLoan,
  useApproveLoan,
  useRejectLoan,
  useDisburseLoan,
  useLoanPayments,
  useCreateLoanPayment,
} from '../../hooks/useLoans';
import type {
  LoanFilters,
  LoanStatus,
  SaccoLoan,
  LoanPayment,
  CreateLoanRequest,
  CreateLoanPaymentRequest,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Modal, TextArea } from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import { AlertCircle, Calendar, DollarSign, Filter, Plus, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoanFormState {
  principal_amount: string;
  interest_rate: string;
  duration_months: number;
  purpose: string;
  repayment_frequency: 'monthly' | 'weekly';
}

interface PaymentFormState {
  payment_date: string;
  total_amount: string;
  interest_amount: string;
  payment_method: string;
  reference_number: string;
  notes: string;
}

interface LoanScheduleRow {
  index: number;
  dueDate: string;
  amount: number;
  cumulativeDue: number;
  cumulativePaid: number;
}

export default function LoansList() {
  const { data: currentMember, isLoading: currentMemberLoading } = useCurrentMember();

  const isSecretary = !!(
    currentMember &&
    (currentMember.role?.toLowerCase().includes('secretary') ?? false)
  );
  const { data: allMembers = [] } = useMembers({ status: 'active' });

  const [viewAllMembers, setViewAllMembers] = useState(false);
  const [memberFilter, setMemberFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('');

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<SaccoLoan | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [applyForm, setApplyForm] = useState<LoanFormState>({
    principal_amount: '',
    interest_rate: '10',
    duration_months: 12,
    purpose: '',
    repayment_frequency: 'monthly',
  });

  const [issueForm, setIssueForm] = useState<LoanFormState & { memberId: number | ''; application_date: string; disbursement_date: string }>({
    principal_amount: '',
    interest_rate: '10',
    duration_months: 12,
    purpose: '',
    repayment_frequency: 'monthly',
    memberId: '',
    application_date: new Date().toISOString().slice(0, 10),
    disbursement_date: new Date().toISOString().slice(0, 10),
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      payment_date: today,
      total_amount: '',
      interest_amount: '',
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    };
  });

  const loanFilters: LoanFilters | undefined = useMemo(() => {
    const filters: LoanFilters = {};
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
    data: loans = [],
    isLoading: loansLoading,
    error: loansError,
    refetch: refetchLoans,
  } = useLoans(loanFilters);

  const createLoan = useCreateLoan();
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const disburseLoan = useDisburseLoan();
  const createLoanPayment = useCreateLoanPayment();

  const {
    data: loanPayments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useLoanPayments(selectedLoan?.id || 0);

  const handleOpenDetail = (loan: SaccoLoan) => {
    setSelectedLoan(loan);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedLoan(null);
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const handleApplySubmit = async () => {
    if (!currentMember || !applyForm.principal_amount || !applyForm.purpose) return;
    const today = todayStr();
    const payload: Omit<CreateLoanRequest, 'sacco'> = {
      member: currentMember.id,
      principal_amount: applyForm.principal_amount,
      interest_rate: applyForm.interest_rate,
      duration_months: applyForm.duration_months,
      purpose: applyForm.purpose,
      application_date: today,
      repayment_frequency: applyForm.repayment_frequency,
    };
    await createLoan.mutateAsync(payload);
    setIsApplyModalOpen(false);
    setApplyForm({
      principal_amount: '',
      interest_rate: '10',
      duration_months: 12,
      purpose: '',
      repayment_frequency: 'monthly',
    });
    await refetchLoans();
  };

  const handleIssueSubmit = async () => {
    if (!issueForm.memberId || !issueForm.principal_amount || !issueForm.purpose) return;
    const payload: Omit<CreateLoanRequest, 'sacco'> = {
      member: issueForm.memberId as number,
      principal_amount: issueForm.principal_amount,
      interest_rate: issueForm.interest_rate,
      duration_months: issueForm.duration_months,
      purpose: issueForm.purpose,
      application_date: issueForm.application_date,
      repayment_frequency: issueForm.repayment_frequency,
    };
    try {
      // 1) Create loan (status: pending)
      const loan = await createLoan.mutateAsync(payload);

      // 2) Approve loan so it can be disbursed
      await approveLoan.mutateAsync(loan.id);

      // 3) Disburse loan with specified date
      const updated = await disburseLoan.mutateAsync({ loanId: loan.id, disbursementDate: issueForm.disbursement_date });

      setSelectedLoan(updated);
      setIsIssueModalOpen(false);
      setIssueForm({
        principal_amount: '',
        interest_rate: '10',
        duration_months: 12,
        purpose: '',
        repayment_frequency: 'monthly',
        memberId: '',
        application_date: new Date().toISOString().slice(0, 10),
        disbursement_date: new Date().toISOString().slice(0, 10),
      });
      await refetchLoans();
      await refetchPayments();
      toast.success('Loan issued and disbursed successfully');
    } catch (error: unknown) {
      console.error('Error issuing loan:', error);
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
        (data ? JSON.stringify(data) : 'Failed to issue loan. Please try again.');
      toast.error(message);
    }
  };

  const handleDisbursePendingLoan = async () => {
    if (!selectedLoan || !isSecretary) return;
    const today = todayStr();
    if (selectedLoan.status === 'pending') {
      await approveLoan.mutateAsync(selectedLoan.id);
    }
    const updated = await disburseLoan.mutateAsync({ loanId: selectedLoan.id, disbursementDate: today });
    setSelectedLoan(updated);
    await refetchLoans();
    await refetchPayments();
  };

  const handleRejectLoan = async () => {
    if (!selectedLoan || !isSecretary) return;

    try {
      const updated = await rejectLoan.mutateAsync({ loanId: selectedLoan.id, reason: rejectReason });
      setSelectedLoan(updated);
      setIsRejectModalOpen(false);
      setRejectReason('');
      await refetchLoans();
      toast.success('Loan rejected');
    } catch (error: unknown) {
      console.error('Error rejecting loan:', error);
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
        (data ? JSON.stringify(data) : 'Failed to reject loan. Please try again.');
      toast.error(message);
    }
  };

  const handleAddPaymentSubmit = async () => {
    if (!selectedLoan || !paymentForm.total_amount) return;
    const total = parseFloat(paymentForm.total_amount || '0');
    const interest = parseFloat(paymentForm.interest_amount || '0');
    const principal = Math.max(0, total - interest);
    const payload: CreateLoanPaymentRequest = {
      loan: selectedLoan.id,
      payment_date: paymentForm.payment_date,
      total_amount: paymentForm.total_amount,
      principal_amount: principal.toString(),
      interest_amount: interest.toString(),
      payment_method: paymentForm.payment_method || undefined,
      reference_number: paymentForm.reference_number || undefined,
      notes: paymentForm.notes || undefined,
    };
    try {
      await createLoanPayment.mutateAsync(payload);
      toast.success('Loan payment recorded successfully');
      setIsAddPaymentModalOpen(false);
      setPaymentForm({
        ...paymentForm,
        total_amount: '',
        interest_amount: '',
        reference_number: '',
        notes: '',
      });
      await refetchLoans();
      await refetchPayments();
    } catch (error: unknown) {
      // Surface backend validation errors (e.g. 400 Bad Request) to the user
      console.error('Error recording loan payment:', error);
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
        (data ? JSON.stringify(data) : 'Failed to record loan payment. Please try again.');
      toast.error(message);
    }
  };

  const buildSchedule = (loan: SaccoLoan | null, payments: LoanPayment[]): LoanScheduleRow[] => {
    if (!loan) return [];
    const totalAmount = parseFloat(loan.total_amount || loan.principal_amount || '0');
    const durationMonths = loan.duration_months || 0;
    if (!totalAmount || !durationMonths) return [];
    const frequency = loan.repayment_frequency === 'weekly' ? 'weekly' : 'monthly';
    const periods = frequency === 'weekly' ? durationMonths * 4 : durationMonths;
    if (!periods) return [];
    const installment = totalAmount / periods;
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.total_amount || '0'), 0);
    const rows: LoanScheduleRow[] = [];
    let cumulativeDue = 0;
    let cumulativePaid = 0;
    const startStr = loan.disbursement_date || loan.approval_date || loan.application_date;
    const start = startStr ? new Date(startStr) : new Date();
    for (let i = 0; i < periods; i++) {
      const d = new Date(start.getTime());
      if (frequency === 'weekly') {
        d.setDate(start.getDate() + i * 7);
      } else {
        d.setMonth(start.getMonth() + i);
      }
      cumulativeDue += installment;
      cumulativePaid = Math.min(totalPaid, cumulativeDue);
      rows.push({
        index: i + 1,
        dueDate: d.toISOString().slice(0, 10),
        amount: installment,
        cumulativeDue,
        cumulativePaid,
      });
    }
    return rows;
  };

  const scheduleRows = useMemo(
    () => buildSchedule(selectedLoan, loanPayments),
    [selectedLoan, loanPayments],
  );

  if (!viewAllMembers && currentMemberLoading) {
    return <Loading message="Loading loans..." />;
  }

  if (loansLoading) {
    return <Loading message="Loading loans..." />;
  }

  if (loansError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading loans</p>
          <p className="text-sm mt-1">{(loansError as Error).message}</p>
        </div>
      </div>
    );
  }

  const effectiveLoans = loans || [];

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <UserCircle2 size={16} />
            {viewAllMembers && isSecretary ? "Viewing all members' loans" : 'Viewing your loans'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {isSecretary && (
            <Button
              variant={viewAllMembers ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewAllMembers((prev) => !prev)}
            >
              {viewAllMembers ? 'Show My Loans Only' : 'View All Members Loans'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for Loan
          </Button>
          {isSecretary && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<DollarSign size={16} />}
              onClick={() => setIsIssueModalOpen(true)}
            >
              Issue Loan to Member
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Filter size={14} /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LoanStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
              <option value="active">Active</option>
              <option value="paid">Paid</option>
              <option value="defaulted">Defaulted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {isSecretary && viewAllMembers && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
              <select
                value={memberFilter === 'all' ? '' : memberFilter}
                onChange={(e) =>
                  setMemberFilter(e.target.value ? Number(e.target.value) : 'all')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Members</option>
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} (#{m.member_number})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loans ({effectiveLoans.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {effectiveLoans.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <AlertCircle size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No loans found</p>
              <p className="text-sm mt-1">Use "Apply for Loan" to request a new loan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied / Due
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {effectiveLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenDetail(loan)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.member_name || 'Member'}
                        </div>
                        {loan.member_number && (
                          <div className="text-xs text-gray-500">#{loan.member_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {loan.loan_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.principal_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.total_amount || loan.principal_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(loan.total_balance)}
                        {loan.is_overdue && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            loan.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : loan.status === 'active' || loan.status === 'disbursed'
                              ? 'bg-indigo-100 text-indigo-800'
                              : loan.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : loan.status === 'defaulted'
                              ? 'bg-red-100 text-red-800'
                              : loan.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(loan.application_date)}</div>
                        {loan.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar size={12} /> Due {formatDate(loan.due_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(loan);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Loan"
      >
        <div className="space-y-4">
          <Input
            label="Principal Amount (UGX)"
            type="number"
            value={applyForm.principal_amount}
            onChange={(e) =>
              setApplyForm({ ...applyForm, principal_amount: e.target.value })
            }
            leftIcon={<DollarSign size={16} />}
          />
          <Input
            label="Interest Rate (%)"
            type="number"
            value={applyForm.interest_rate}
            onChange={(e) => setApplyForm({ ...applyForm, interest_rate: e.target.value })}
          />
          <Input
            label="Duration (months)"
            type="number"
            value={applyForm.duration_months.toString()}
            onChange={(e) =>
              setApplyForm({ ...applyForm, duration_months: Number(e.target.value) || 0 })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repayment Frequency
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={applyForm.repayment_frequency === 'monthly'}
                  onChange={() =>
                    setApplyForm({ ...applyForm, repayment_frequency: 'monthly' })
                  }
                />
                Monthly
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={applyForm.repayment_frequency === 'weekly'}
                  onChange={() =>
                    setApplyForm({ ...applyForm, repayment_frequency: 'weekly' })
                  }
                />
                Weekly
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              value={applyForm.purpose}
              onChange={(e) => setApplyForm({ ...applyForm, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows={3}
              placeholder="Reason for the loan"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApplySubmit}
              isLoading={createLoan.isPending}
              disabled={!applyForm.principal_amount || !applyForm.purpose}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Loan to Member"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <select
              value={issueForm.memberId}
              onChange={(e) =>
                setIssueForm({ ...issueForm, memberId: Number(e.target.value) || '' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select member...</option>
              {allMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} (#{m.member_number})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Principal Amount (UGX)"
            type="number"
            value={issueForm.principal_amount}
            onChange={(e) =>
              setIssueForm({ ...issueForm, principal_amount: e.target.value })
            }
            leftIcon={<DollarSign size={16} />}
          />
          <Input
            label="Interest Rate (%)"
            type="number"
            value={issueForm.interest_rate}
            onChange={(e) => setIssueForm({ ...issueForm, interest_rate: e.target.value })}
          />
          <Input
            label="Duration (months)"
            type="number"
            value={issueForm.duration_months.toString()}
            onChange={(e) =>
              setIssueForm({ ...issueForm, duration_months: Number(e.target.value) || 0 })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repayment Frequency
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={issueForm.repayment_frequency === 'monthly'}
                  onChange={() =>
                    setIssueForm({ ...issueForm, repayment_frequency: 'monthly' })
                  }
                />
                Monthly
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={issueForm.repayment_frequency === 'weekly'}
                  onChange={() =>
                    setIssueForm({ ...issueForm, repayment_frequency: 'weekly' })
                  }
                />
                Weekly
              </label>
            </div>
          </div>
          <Input
            label="Application Date (Optional)"
            type="date"
            value={issueForm.application_date}
            onChange={(e) => setIssueForm({ ...issueForm, application_date: e.target.value })}
            leftIcon={<Calendar size={16} />}
          />
          <Input
            label="Disbursement Date (Optional)"
            type="date"
            value={issueForm.disbursement_date}
            onChange={(e) => setIssueForm({ ...issueForm, disbursement_date: e.target.value })}
            leftIcon={<Calendar size={16} />}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              value={issueForm.purpose}
              onChange={(e) => setIssueForm({ ...issueForm, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows={3}
              placeholder="Reason for the loan"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleIssueSubmit}
              isLoading={createLoan.isPending || approveLoan.isPending || disburseLoan.isPending}
              disabled={!issueForm.memberId || !issueForm.principal_amount || !issueForm.purpose}
            >
              Issue Loan
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen && !!selectedLoan}
        onClose={handleCloseDetail}
        title={selectedLoan ? `Loan ${selectedLoan.loan_number}` : 'Loan Details'}
        size="lg"
      >
        {selectedLoan && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Member</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedLoan.member_name || 'Member'}
                </p>
                {selectedLoan.member_number && (
                  <p className="text-xs text-gray-500">#{selectedLoan.member_number}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <p
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedLoan.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedLoan.status === 'active' || selectedLoan.status === 'disbursed'
                      ? 'bg-green-100 text-green-800'
                      : selectedLoan.status === 'defaulted'
                      ? 'bg-red-100 text-red-800'
                      : selectedLoan.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedLoan.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Principal</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(selectedLoan.principal_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(selectedLoan.total_amount || selectedLoan.principal_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(selectedLoan.total_balance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedLoan.interest_rate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Applied On</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedLoan.application_date)}
                </p>
              </div>
              {selectedLoan.due_date && (
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedLoan.due_date)}
                  </p>
                </div>
              )}
              {selectedLoan.status === 'rejected' && !!selectedLoan.rejection_reason?.trim() && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Rejection Reason</p>
                  <p className="text-sm text-red-700 whitespace-pre-wrap">
                    {selectedLoan.rejection_reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              {isSecretary && selectedLoan.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={approveLoan.isPending || disburseLoan.isPending || rejectLoan.isPending}
                  >
                    Reject Loan
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDisbursePendingLoan}
                    isLoading={approveLoan.isPending || disburseLoan.isPending}
                    disabled={rejectLoan.isPending}
                  >
                    Disburse Loan
                  </Button>
                </>
              )}
              {isSecretary && (selectedLoan.status === 'active' || selectedLoan.status === 'disbursed') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddPaymentModalOpen(true)}
                >
                  Add Payment
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Schedule</h4>
                {scheduleRows.length === 0 ? (
                  <p className="text-xs text-gray-500">Schedule will appear after disbursement.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Due</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {scheduleRows.map((row) => (
                          <tr key={row.index}>
                            <td className="px-3 py-1.5 text-gray-700">{row.index}</td>
                            <td className="px-3 py-1.5 text-gray-700">{formatDate(row.dueDate)}</td>
                            <td className="px-3 py-1.5 text-right text-gray-700">
                              {formatCurrency(row.amount.toFixed(2))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Payments</h4>
                {paymentsLoading ? (
                  <p className="text-xs text-gray-500">Loading payments...</p>
                ) : loanPayments.length === 0 ? (
                  <p className="text-xs text-gray-500">No payments recorded yet.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">Principal</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">Interest</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loanPayments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-1.5 text-gray-700">{formatDate(p.payment_date)}</td>
                            <td className="px-3 py-1.5 text-right text-gray-700">
                              {formatCurrency(p.total_amount)}
                            </td>
                            <td className="px-3 py-1.5 text-right text-gray-700">
                              {formatCurrency(p.principal_amount)}
                            </td>
                            <td className="px-3 py-1.5 text-right text-gray-700">
                              {formatCurrency(p.interest_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isRejectModalOpen && !!selectedLoan}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectReason('');
        }}
        title="Reject Loan"
        size="sm"
      >
        {selectedLoan && (
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              Are you sure you want to reject loan <span className="font-semibold">{selectedLoan.loan_number}</span>?
            </div>
            <TextArea
              label="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Add a brief reason for rejecting this loan (optional)"
              rows={4}
            />
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                disabled={rejectLoan.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectLoan}
                isLoading={rejectLoan.isPending}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddPaymentModalOpen && !!selectedLoan}
        onClose={() => setIsAddPaymentModalOpen(false)}
        title="Add Loan Payment"
      >
        {selectedLoan && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex justify-between">
              <span>Outstanding Balance:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(selectedLoan.total_balance)}
              </span>
            </div>
            <Input
              label="Payment Date"
              type="date"
              value={paymentForm.payment_date}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              leftIcon={<Calendar size={16} />}
            />
            <Input
              label="Total Amount (UGX)"
              type="number"
              value={paymentForm.total_amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, total_amount: e.target.value })
              }
              leftIcon={<DollarSign size={16} />}
            />
            <Input
              label="Interest Portion (UGX)"
              type="number"
              value={paymentForm.interest_amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, interest_amount: e.target.value })
              }
            />
            <Input
              label="Payment Method"
              type="text"
              value={paymentForm.payment_method}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, payment_method: e.target.value })
              }
              placeholder="e.g. Cash, Bank, Mobile Money"
            />
            <Input
              label="Reference Number"
              type="text"
              value={paymentForm.reference_number}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, reference_number: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                rows={3}
                placeholder="Optional notes about this payment"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddPaymentSubmit}
                isLoading={createLoanPayment.isPending}
                disabled={!paymentForm.total_amount}
              >
                Save Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
