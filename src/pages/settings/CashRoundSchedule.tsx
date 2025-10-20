import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { useMembers } from '../../hooks/useMembers';
import { cashRoundApi } from '../../api/cashRound';
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Modal } from '../../components/common';
import { Plus, ArrowLeft, Users, Calendar, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { CashRoundScheduleDetail, CreateCashRoundScheduleRequest } from '../../types';

export default function CashRoundSchedule() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['cash-round-schedules', currentSacco?.id],
    queryFn: () => cashRoundApi.getCashRoundSchedules(currentSacco!.id),
    enabled: !!currentSacco,
  });

  const { data: members = [] } = useMembers();

  const activeSchedule = schedules.find((s) => s.is_active) as CashRoundScheduleDetail | undefined;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateCashRoundScheduleRequest) =>
      cashRoundApi.createCashRoundSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedules', currentSacco?.id] });
      setIsCreateModalOpen(false);
      setSelectedMembers([]);
      toast.success('Cash round schedule created successfully!');
    },
    onError: () => {
      toast.error('Failed to create cash round schedule');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (scheduleId: number) =>
      cashRoundApi.updateCashRoundSchedule(scheduleId, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedules', currentSacco?.id] });
      toast.success('Schedule deactivated successfully!');
    },
    onError: () => {
      toast.error('Failed to deactivate schedule');
    },
  });

  const advanceMutation = useMutation({
    mutationFn: (scheduleId: number) => cashRoundApi.advanceCashRound(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-round-schedules', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['meetings', currentSacco?.id] });
      toast.success('Advanced to next recipient!');
    },
    onError: () => {
      toast.error('Failed to advance cash round');
    },
  });

  const handleCreate = () => {
    if (!currentSacco) return;
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    createMutation.mutate({
      sacco: currentSacco.id,
      start_date: startDate,
      rotation_order: selectedMembers,
      is_active: true,
    });
  };

  const handleToggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...selectedMembers];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSelectedMembers(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedMembers.length - 1) return;
    const newOrder = [...selectedMembers];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedMembers(newOrder);
  };

  const handleSelectAll = () => {
    setSelectedMembers(members.map((m) => m.id));
  };

  const handleDeactivate = (scheduleId: number) => {
    if (window.confirm('Are you sure you want to deactivate this schedule?')) {
      deactivateMutation.mutate(scheduleId);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Cash Round Schedule</h1>
              <p className="text-gray-600 mt-1">
                Manage the rotation order for cash round recipients
              </p>
            </div>
          </div>
        </div>
        {!activeSchedule && (
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Schedule
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calendar className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">How Cash Round Works</h3>
              <p className="text-sm text-gray-600 mt-1">
                The cash round schedule determines which member receives the collected contributions
                each week. The schedule rotates automatically when a meeting is finalized.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Active Schedule */}
      {activeSchedule ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Schedule</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RotateCw size={16} />}
                    onClick={() => advanceMutation.mutate(activeSchedule.id)}
                    isLoading={advanceMutation.isPending}
                  >
                    Advance to Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(activeSchedule.id)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(activeSchedule.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Total Members
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {activeSchedule.rotation_order.length}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Current Position
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {activeSchedule.current_position + 1} of {activeSchedule.rotation_order.length}
                  </p>
                </div>
              </div>

              {/* Current and Next Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">
                    Current Recipient
                  </h3>
                  {activeSchedule.current_recipient ? (
                    <div>
                      <p className="font-semibold text-green-900">
                        {activeSchedule.current_recipient.first_name}{' '}
                        {activeSchedule.current_recipient.last_name}
                      </p>
                      <p className="text-sm text-green-700">
                        #{activeSchedule.current_recipient.member_number}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-700">No recipient assigned</p>
                  )}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Next Recipient
                  </h3>
                  {activeSchedule.next_recipient ? (
                    <div>
                      <p className="font-semibold text-blue-900">
                        {activeSchedule.next_recipient.first_name}{' '}
                        {activeSchedule.next_recipient.last_name}
                      </p>
                      <p className="text-sm text-blue-700">
                        #{activeSchedule.next_recipient.member_number}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">No next recipient</p>
                  )}
                </div>
              </div>

              {/* Rotation Order */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Rotation Order</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeSchedule.rotation_order.map((memberId, index) => {
                    const member = members.find((m) => m.id === memberId);
                    const isCurrent = index === activeSchedule.current_position;
                    const isNext =
                      index === (activeSchedule.current_position + 1) % activeSchedule.rotation_order.length;

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
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">
                                #{index + 1}
                              </span>
                              <p className="font-medium text-gray-900">
                                {member?.first_name} {member?.last_name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {member?.member_number || 'Unknown'}
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
            </CardBody>
          </Card>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading schedules...</div>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Active Cash Round Schedule
              </h3>
              <p className="text-gray-600 mb-4">
                Create a cash round schedule to start rotating recipients
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus size={18} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Schedule
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Previous Schedules */}
      {schedules.filter((s) => !s.is_active).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Schedules</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {schedules
                .filter((s) => !s.is_active)
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Started: {new Date(schedule.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.rotation_order.length} members
                          {schedule.end_date &&
                            ` • Ended: ${new Date(schedule.end_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                        Inactive
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Create Schedule Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Cash Round Schedule"
      >
        <div className="space-y-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Members ({selectedMembers.length} selected)
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleToggleMember(member.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-gray-500">#{member.member_number}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rotation Order (Drag to reorder)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                {selectedMembers.map((memberId, index) => {
                  const member = members.find((m) => m.id === memberId);
                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-2 p-2 bg-white border rounded"
                    >
                      <span className="text-sm font-medium text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member?.first_name} {member?.last_name}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === selectedMembers.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={createMutation.isPending}
              disabled={selectedMembers.length === 0}
            >
              Create Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
