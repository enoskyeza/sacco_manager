import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useMeetings } from '../../hooks/useMeetings';
import type { MeetingStatus } from '../../types';
import { Button, EmptyState } from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import MeetingCard from '../../components/meetings/MeetingCard';

export default function MeetingsList() {
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | ''>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const { data, isLoading, error } = useMeetings({
    status: statusFilter || undefined,
    year,
  });
  
  const meetings = data?.results || [];

  if (isLoading) {
    return <Loading message="Loading meetings..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading meetings</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Meetings</h1>
          <p className="text-gray-600 mt-1">
            {meetings.length} meetings recorded
          </p>
        </div>
        <Link to="/meetings/new">
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            New Meeting
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MeetingStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings Grid */}
      {meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Filter size={48} />}
          title="No meetings found"
          description={
            statusFilter || year !== new Date().getFullYear()
              ? 'Try adjusting your filters'
              : 'Get started by creating your first weekly meeting'
          }
          action={
            !statusFilter && year === new Date().getFullYear()
              ? {
                  label: 'Create First Meeting',
                  onClick: () => window.location.href = '/meetings/new',
                  icon: <Plus size={18} />,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
