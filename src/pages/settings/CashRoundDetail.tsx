import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Edit, Play, CheckCircle, Calendar, Users, DollarSign, Clock, User, Plus } from 'lucide-react';
import { useSacco } from '../../hooks/useSacco';
import { cashRoundApi } from '../../api/cashRound';
import { toast } from 'sonner';
import { useState } from 'react';
import CreateScheduleModal from '../../components/cash-rounds/CreateScheduleModal';
import EditScheduleModal from '../../components/cash-rounds/EditScheduleModal';
import CreateDeductionRuleModal from '../../components/cash-rounds/CreateDeductionRuleModal';
import apiClient from '../../api/client';

export default function CashRoundDetail() {
  const { id } = useParams();
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [isDeductionRuleModalOpen, setIsDeductionRuleModalOpen] = useState(false);

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (rotationOrder: number[]) => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.post(
        `/saccos/${currentSacco!.id}/cash-round-schedules/`,
        {
          cash_round: parseInt(id!),
          sacco: currentSacco!.id,
          rotation_order: rotationOrder,
          start_date: today,
          is_active: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-round', currentSacco?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['cash-round-members', currentSacco?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedule', currentSacco?.id, id] });
      setIsScheduleModalOpen(false);
      toast.success('Schedule created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create schedule');
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ scheduleId, rotationOrder }: { scheduleId: number; rotationOrder: number[] }) => {
      const response = await apiClient.patch(
        `/saccos/${currentSacco!.id}/cash-round-schedules/${scheduleId}/`,
        {
          rotation_order: rotationOrder,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-round', currentSacco?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['cash-round-members', currentSacco?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedule', currentSacco?.id, id] });
      setIsEditScheduleModalOpen(false);
      toast.success('Schedule updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update schedule');
    },
  });

  // Create deduction rule mutation
  const createDeductionRuleMutation = useMutation({
    mutationFn: async (data: { section: number; applies_to: string }) => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.post(
        `/saccos/cash-rounds/${id}/deduction-rules/`,
        {
          cash_round: parseInt(id!),
          section: data.section,
          applies_to: data.applies_to,
          is_active: true,
          effective_from: today,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-round', currentSacco?.id, id] });
      queryClient.invalidateQueries({ queryKey: ['deduction-rules', currentSacco?.id, id] });
      setIsDeductionRuleModalOpen(false);
      toast.success('Deduction rule created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create deduction rule');
    },
  });

  const handleCreateSchedule = (rotationOrder: number[]) => {
    createScheduleMutation.mutate(rotationOrder);
  };

  const handleEditSchedule = () => {
    setIsEditScheduleModalOpen(true);
  };

  const handleUpdateSchedule = (scheduleId: number, rotationOrder: number[]) => {
    updateScheduleMutation.mutate({ scheduleId, rotationOrder });
  };

  const handleCreateDeductionRule = (data: { section: number; applies_to: string }) => {
    createDeductionRuleMutation.mutate(data);
  };

  // Fetch cash round
  const { data: cashRound, isLoading } = useQuery({
    queryKey: ['cash-round', currentSacco?.id, id],
    queryFn: () => cashRoundApi.getCashRound(currentSacco!.id, parseInt(id!)),
    enabled: !!currentSacco && !!id,
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['cash-round-members', currentSacco?.id, id],
    queryFn: () => cashRoundApi.getCashRoundMembers(currentSacco!.id, parseInt(id!)),
    enabled: !!currentSacco && !!id,
  });

  // Fetch deduction rules
  const { data: deductionRules = [] } = useQuery({
    queryKey: ['deduction-rules', currentSacco?.id, id],
    queryFn: async () => {
      const response = await apiClient.get(
        `/saccos/cash-rounds/${id}/deduction-rules/`
      );
      return response.data.results || response.data;
    },
    enabled: !!currentSacco && !!id,
  });

  // Fetch schedule
  const { data: schedule } = useQuery({
    queryKey: ['cash-round-schedule', currentSacco?.id, id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `/saccos/${currentSacco!.id}/cash-round-schedules/`
        );
        const schedules = Array.isArray(response.data) ? response.data : (response.data.results || []);
        // Find the schedule for this cash round (cash_round is OneToOne, so there's only one)
        const foundSchedule = schedules.find((s: any) => s.cash_round === parseInt(id!));
        console.log('All schedules:', schedules);
        console.log('Looking for cash_round ID:', parseInt(id!));
        console.log('Found schedule:', foundSchedule);
        return foundSchedule || null;
      } catch (error) {
        console.error('Error fetching schedule:', error);
        return null;
      }
    },
    enabled: !!currentSacco && !!id,
  });

  const handleStartRound = async () => {
    if (!currentSacco || !id) return;
    
    try {
      await cashRoundApi.startCashRound(currentSacco.id, parseInt(id));
      queryClient.invalidateQueries({ queryKey: ['cash-round'] });
      toast.success('Cash round started successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start cash round');
    }
  };

  const handleCompleteRound = async () => {
    if (!currentSacco || !id) return;
    
    if (!confirm('Are you sure you want to complete this cash round?')) return;
    
    try {
      await cashRoundApi.completeCashRound(currentSacco.id, parseInt(id));
      queryClient.invalidateQueries({ queryKey: ['cash-round'] });
      toast.success('Cash round completed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete cash round');
    }
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

  if (!cashRound) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Cash round not found
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || styles.planned;
  };

  const hasSchedule = !!schedule;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Link
            to="/settings/cash-rounds"
            className="text-gray-600 hover:text-gray-900 transition-colors mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{cashRound.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusBadge(cashRound.status)}`}>
                {cashRound.status.charAt(0).toUpperCase() + cashRound.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Round #{cashRound.round_number}</p>
          </div>
        </div>
          
        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {cashRound.status === 'planned' && hasSchedule && (
            <button
              onClick={handleStartRound}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Play className="h-4 w-4" />
              Start Round
            </button>
          )}
          
          {cashRound.status === 'active' && (
            <button
              onClick={handleCompleteRound}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Round
            </button>
          )}
          
          {cashRound.status !== 'completed' && (
            <Link
              to={`/settings/cash-rounds/${id}/edit`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Start Date</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {new Date(cashRound.start_date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Expected End Date</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {new Date(cashRound.expected_end_date).toLocaleDateString()}
              </p>
            </div>

            {cashRound.created_by_name && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Created By</span>
                </div>
                <p className="text-base font-semibold text-gray-900">{cashRound.created_by_name}</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Members</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{cashRound.member_count}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-base font-semibold text-gray-900">{cashRound.num_weeks} weeks</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Weekly Amount</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                UGX {parseFloat(cashRound.weekly_amount).toLocaleString()}
              </p>
            </div>
          </div>

          {cashRound.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{cashRound.notes}</p>
            </div>
          )}
        </div>

        {/* Members & Rotation Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Members & Rotation</h2>
            {members.length > 0 && (
              hasSchedule ? (
                <button 
                  onClick={handleEditSchedule}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <button 
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Create Schedule
                </button>
              )
            )}
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No members in this round</p>
            </div>
          ) : !hasSchedule ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No rotation schedule created</p>
              <p className="text-sm mt-1">Create a schedule to set the payout rotation order</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">
                    Current Recipient
                  </h3>
                  {schedule.current_recipient ? (
                    <div>
                      <p className="font-semibold text-green-900">
                        {schedule.current_recipient.name}
                      </p>
                      <p className="text-sm text-green-700">
                        #{schedule.current_recipient.member_number}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-700">Not assigned</p>
                  )}
                </div>

                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Next Recipient
                  </h3>
                  {schedule.next_recipient ? (
                    <div>
                      <p className="font-semibold text-blue-900">
                        {schedule.next_recipient.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        #{schedule.next_recipient.member_number}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">Not assigned</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Rotation Order (Position {schedule.current_position + 1} of {schedule.rotation_order.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {schedule.rotation_order.map((memberId: number, index: number) => {
                    const member = members.find(m => m.member === memberId);
                    const isCurrent = index === schedule.current_position;
                    const isNext = index === (schedule.current_position + 1) % schedule.rotation_order.length;

                    return (
                      <div
                        key={memberId}
                        className={`p-3 rounded-lg border-2 ${
                          isCurrent
                            ? 'bg-green-50 border-green-500'
                            : isNext
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              <p className="font-medium text-gray-900 text-sm">
                                {member?.member_name || 'Unknown'}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {member?.member_number || 'N/A'}
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Current
                            </span>
                          )}
                          {isNext && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Next
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Deduction Rules Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Deduction Rules</h2>
            <button 
              onClick={() => setIsDeductionRuleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Rule
            </button>
          </div>

          {deductionRules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No deduction rules configured</p>
              <p className="text-sm mt-1">Create rules to automatically deduct fees from contributions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deductionRules.map((rule: any) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{rule.section_name}</h3>
                      {rule.is_active ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>UGX {parseFloat(rule.amount).toLocaleString()}</span>
                      <span>•</span>
                      <span className="capitalize">{rule.applies_to.replace('_', ' ')}</span>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting History Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting History</h2>
          
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No meetings yet</p>
            <p className="text-sm mt-1">
              {cashRound.status === 'planned' 
                ? 'Meetings will appear here once the round is started'
                : 'Start your first meeting to see it here'}
            </p>
          </div>
        </div>
      </div>

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        members={members}
        onSubmit={handleCreateSchedule}
        isLoading={createScheduleMutation.isPending}
      />

      {/* Create Deduction Rule Modal */}
      <CreateDeductionRuleModal
        isOpen={isDeductionRuleModalOpen}
        onClose={() => setIsDeductionRuleModalOpen(false)}
        onSubmit={handleCreateDeductionRule}
        isLoading={createDeductionRuleMutation.isPending}
      />

      {/* Edit Schedule Modal */}
      {schedule && (
        <EditScheduleModal
          isOpen={isEditScheduleModalOpen}
          onClose={() => setIsEditScheduleModalOpen(false)}
          members={members}
          currentRotationOrder={schedule.rotation_order}
          scheduleId={schedule.id}
          onSubmit={handleUpdateSchedule}
          isLoading={updateScheduleMutation.isPending}
        />
      )}
    </div>
  );
}
