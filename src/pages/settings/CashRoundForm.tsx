import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Users, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { useMembers } from '../../hooks/useMembers';
import { cashRoundApi } from '../../api/cashRound';
import type { CreateCashRoundRequest } from '../../api/cashRound';
import { toast } from 'sonner';

export default function CashRoundForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Form state
  const [formData, setFormData] = useState<CreateCashRoundRequest>({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    weekly_amount: 0,
    member_ids: [],
    notes: '',
  });
  
  const [status, setStatus] = useState<'planned' | 'active' | 'completed' | 'cancelled'>('planned');

  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // Fetch members
  const { data: members = [] } = useMembers();

  // Fetch existing round if editing
  const { data: existingRound } = useQuery({
    queryKey: ['cash-round', currentSacco?.id, id],
    queryFn: () => cashRoundApi.getCashRound(currentSacco!.id, parseInt(id!)),
    enabled: !!currentSacco && isEdit,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingRound) {
      setFormData({
        name: existingRound.name,
        start_date: existingRound.start_date,
        weekly_amount: parseFloat(existingRound.weekly_amount),
        member_ids: existingRound.members?.map(m => m.member) || [],
        notes: existingRound.notes || '',
      });
      setSelectedMembers(existingRound.members?.map(m => m.member) || []);
      setStatus(existingRound.status);
    }
  }, [existingRound]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCashRoundRequest) =>
      cashRoundApi.createCashRound(currentSacco!.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cash-rounds'] });
      toast.success('Cash round created successfully!');
      navigate(`/settings/cash-rounds/${data.id}`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string; detail?: string } } };
      const message = err.response?.data?.error || err.response?.data?.detail || 'Failed to create cash round';
      console.error('Create cash round error:', error);
      toast.error(message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCashRoundRequest> & { status?: string }) =>
      cashRoundApi.updateCashRound(currentSacco!.id, parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-rounds'] });
      queryClient.invalidateQueries({ queryKey: ['cash-round', currentSacco?.id, id] });
      toast.success('Cash round updated successfully!');
      navigate(`/settings/cash-rounds/${id}`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string; detail?: string } } };
      const message = err.response?.data?.error || err.response?.data?.detail || 'Failed to update cash round';
      console.error('Update cash round error:', error);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a name for the cash round');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    if (formData.weekly_amount <= 0) {
      toast.error('Weekly amount must be greater than 0');
      return;
    }

    console.log('=== SUBMITTING CASH ROUND ===');
    console.log('Form data:', formData);
    console.log('Selected members:', selectedMembers);
    console.log('Current SACCO:', currentSacco);

    if (isEdit) {
      // For edit, include status
      const updateData: Partial<CreateCashRoundRequest> & { status?: string } = {
        ...formData,
        member_ids: selectedMembers,
        status: status,
      };
      console.log('Update data to submit:', updateData);
      updateMutation.mutate(updateData);
    } else {
      // For create, don't include status
      const createData: CreateCashRoundRequest = {
        ...formData,
        member_ids: selectedMembers,
      };
      console.log('Create data to submit:', createData);
      createMutation.mutate(createData);
    }
  };

  const toggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/settings/cash-rounds"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Cash Round' : 'Create New Cash Round'}
          </h1>
        </div>
        <p className="text-gray-600">
          Set up member rotation, weekly amount, and start date
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cash Round Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Round 1 - 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Weekly Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Contribution Amount (UGX) *
              </label>
              <input
                type="number"
                value={formData.weekly_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weekly_amount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="10000"
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Add any additional information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status - Only show when editing */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="mt-2 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Note:</strong> Changing status to "Active" will activate the cash round. 
                    Use "Completed" when the round is finished, or "Cancelled" to cancel it.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Member Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Members *
            </h3>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {selectedMembers.length === members.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Selected: {selectedMembers.length} of {members.length} members
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {members.map((member) => (
              <label
                key={member.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMembers.includes(member.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-gray-500">#{member.member_number}</p>
                </div>
              </label>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No members found. Please add members first.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/settings/cash-rounds"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="h-5 w-5" />
            {isPending ? 'Saving...' : isEdit ? 'Update Cash Round' : 'Create Cash Round'}
          </button>
        </div>
      </form>
    </div>
  );
}
