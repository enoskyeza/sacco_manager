import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, DollarSign, Settings as SettingsIcon, ArrowLeft, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { cashRoundApi } from '../../api/cashRound';
import type { CashRound } from '../../api/cashRound';
import { toast } from 'sonner';

export default function CashRounds() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch cash rounds
  const { data: cashRounds = [], isLoading } = useQuery({
    queryKey: ['cash-rounds', currentSacco?.id, selectedStatus],
    queryFn: () => {
      if (!currentSacco?.id) return [];
      const status = selectedStatus === 'all' ? undefined : selectedStatus;
      return cashRoundApi.getCashRounds(currentSacco.id, status);
    },
    enabled: !!currentSacco,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ roundId }: { roundId: number }) =>
      cashRoundApi.deleteCashRound(currentSacco!.id, roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-rounds'] });
      toast.success('Cash round deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete cash round');
    },
  });

  const handleDelete = (round: CashRound) => {
    if (round.status === 'active') {
      toast.error('Cannot delete an active cash round');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${round.name}"?`)) {
      deleteMutation.mutate({ roundId: round.id });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || styles.planned;
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/settings"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Cash Rounds Management</h1>
        </div>
        <p className="text-gray-600">
          Create and manage cash rounds, configure deduction rules, and set up member rotations.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Rounds</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <Link to="/settings/cash-rounds/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              <Plus className="h-5 w-5" />
              Create New Cash Round
            </button>
          </Link>
        </div>
      </div>

      {/* Cash Rounds List */}
      {cashRounds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cash Rounds Found</h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus === 'all'
              ? 'Get started by creating your first cash round'
              : `No ${selectedStatus} cash rounds found`}
          </p>
          {selectedStatus === 'all' && (
            <Link to="/settings/cash-rounds/new">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                <Plus className="h-5 w-5" />
                Create First Cash Round
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {cashRounds.map((round) => (
            <div
              key={round.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {round.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(round.status)}`}>
                      {getStatusLabel(round.status)}
                    </span>
                  </div>
                </div>

                {/* Round Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Starts: {new Date(round.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{round.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>UGX {parseFloat(round.weekly_amount).toLocaleString()}/week</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-gray-50 flex items-center justify-between gap-2">
                <Link
                  to={`/settings/cash-rounds/${round.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Manage
                </Link>
                
                {round.status !== 'active' && (
                  <button
                    onClick={() => handleDelete(round)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-2">📘 About Cash Rounds</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each cash round has its own member rotation and deduction rules</li>
          <li>• Active rounds appear in the main Cash Rounds page for users</li>
          <li>• Meetings are automatically created based on the rotation schedule</li>
          <li>• You can run multiple cash rounds concurrently</li>
        </ul>
      </div>
    </div>
  );
}
