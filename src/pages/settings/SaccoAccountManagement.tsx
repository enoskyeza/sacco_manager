import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { accountApi } from '../../api/account';
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Modal } from '../../components/common';
import { ArrowLeft, Building2, MapPin, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import type { CreateSaccoAccountRequest, UpdateSaccoAccountRequest, AccountType } from '../../types';

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'savings_account', label: 'Savings Account' },
  { value: 'mtn_money', label: 'MTN Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'cash_wallet', label: 'Cash Wallet' },
];

export default function SaccoAccountManagement() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSaccoAccountRequest>({
    bank_name: '',
    bank_branch: '',
    account_number: '',
    account_type: 'bank',
    account_name: '',
  });

  // Queries
  const { data: account, isLoading, error } = useQuery({
    queryKey: ['sacco-account', currentSacco?.id],
    queryFn: () => accountApi.getSaccoAccount(),
    enabled: !!currentSacco,
    retry: false,
  });

  const { data: summary } = useQuery({
    queryKey: ['sacco-account-summary', currentSacco?.id],
    queryFn: () => accountApi.getAccountSummary(),
    enabled: !!account,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSaccoAccountRequest) => accountApi.createSaccoAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-account', currentSacco?.id] });
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('SACCO account created successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to create account');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSaccoAccountRequest) =>
      accountApi.updateSaccoAccount(account!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco-account', currentSacco?.id] });
      setIsEditModalOpen(false);
      resetForm();
      toast.success('SACCO account updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update account');
    },
  });

  const resetForm = () => {
    setFormData({
      bank_name: '',
      bank_branch: '',
      account_number: '',
      account_type: 'bank',
      account_name: '',
    });
  };

  const handleCreate = () => {
    if (!formData.account_number && !formData.bank_name) {
      toast.error('Please provide at least account number or bank name');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (account) {
      setFormData({
        bank_name: account.bank_name,
        bank_branch: account.bank_branch,
        account_number: account.account_number,
        account_type: account.account_type,
        account_name: account.account_name,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = () => {
    updateMutation.mutate(formData);
  };

  const accountExists = account && !error;

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SACCO Account</h1>
              <p className="text-gray-600 mt-1">
                Manage your SACCO's financial account
              </p>
            </div>
          </div>
        </div>
        {accountExists && (
          <Button variant="primary" onClick={handleEdit}>
            Edit Account Details
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">SACCO Treasury Account</h3>
              <p className="text-sm text-gray-600 mt-1">
                This account tracks all money actually held by the SACCO (in bank or cash).
                It's credited when members make savings and debited when loans are disbursed.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading account...</div>
      ) : !accountExists ? (
        /* No Account - Create New */
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Building2 className="text-indigo-600" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No SACCO Account Yet
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Create a SACCO account to start tracking your organization's finances.
                This will help you manage savings, loans, and expenses.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create SACCO Account
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Account Exists - Show Details */
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-2">Available Funds</p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(account.current_balance)}
                </p>
                {summary && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">Total Income</p>
                      <p className="text-xl font-semibold text-green-900 mt-1">
                        {formatCurrency(summary.total_income)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">Total Expenses</p>
                      <p className="text-xl font-semibold text-red-900 mt-1">
                        {formatCurrency(summary.total_expense)}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">Transactions</p>
                      <p className="text-xl font-semibold text-blue-900 mt-1">
                        {summary.transaction_count}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Account Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Account Name
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {account.account_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Account Type
                  </label>
                  <p className="text-base font-semibold text-gray-900 capitalize">
                    {ACCOUNT_TYPES.find((t) => t.value === account.account_type)?.label ||
                      account.account_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bank Name
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {account.bank_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bank Branch
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {account.bank_branch || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Account Number
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {account.account_number || 'N/A'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create SACCO Account"
      >
        <div className="space-y-4">
          <Input
            label="Account Name"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            placeholder={`${currentSacco?.name} - Main Account`}
            leftIcon={<Building2 size={18} />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.account_type}
              onChange={(e) =>
                setFormData({ ...formData, account_type: e.target.value as AccountType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Bank Name"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            placeholder="e.g., Stanbic Bank, Centenary Bank"
            leftIcon={<Building2 size={18} />}
          />

          <Input
            label="Bank Branch"
            value={formData.bank_branch}
            onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
            placeholder="e.g., Kampala Road Branch"
            leftIcon={<MapPin size={18} />}
          />

          <Input
            label="Account Number"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            placeholder="Enter bank account number"
            leftIcon={<CreditCard size={18} />}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={createMutation.isPending}
            >
              Create Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit SACCO Account"
      >
        <div className="space-y-4">
          <Input
            label="Account Name"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            leftIcon={<Building2 size={18} />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.account_type}
              onChange={(e) =>
                setFormData({ ...formData, account_type: e.target.value as AccountType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Bank Name"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            leftIcon={<Building2 size={18} />}
          />

          <Input
            label="Bank Branch"
            value={formData.bank_branch}
            onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
            leftIcon={<MapPin size={18} />}
          />

          <Input
            label="Account Number"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            leftIcon={<CreditCard size={18} />}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={updateMutation.isPending}
            >
              Update Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
