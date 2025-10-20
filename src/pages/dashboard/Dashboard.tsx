import { Users, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useSacco } from '../../hooks/useSacco';
import { dashboardApi } from '../../api';
import { formatCurrency } from '../../utils/format';
import { Loading } from '../../components/common/Spinner';
import UpcomingMeetingCard from '../../components/dashboard/UpcomingMeetingCard';
import QuickActionsGrid from '../../components/dashboard/QuickActionsGrid';

export default function Dashboard() {
  const { user } = useAuth();
  const { currentSacco } = useSacco();

  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', currentSacco?.id],
    queryFn: () => dashboardApi.getDashboardMetrics(currentSacco!.id),
    enabled: !!currentSacco,
  });

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your SACCO today
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Total Members</p>
              <p className="text-4xl font-bold">{metrics?.total_members || 0}</p>
              <p className="text-indigo-100 text-sm mt-2">
                {metrics?.active_members || 0} active members
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <Users size={32} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Current Account Balance</p>
              <p className="text-4xl font-bold">{formatCurrency(metrics?.account_balance || '0')}</p>
              <p className="text-green-100 text-sm mt-2">
                Total savings: {formatCurrency(metrics?.total_savings || '0')}
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <Wallet size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <QuickActionsGrid />
      </div>

      {/* Upcoming Meeting */}
      {metrics?.next_meeting_date && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UpcomingMeetingCard
              meetingDate={metrics.next_meeting_date}
              recipientName={metrics.current_recipient ? 
                `${metrics.current_recipient.first_name} ${metrics.current_recipient.last_name}` : 
                undefined
              }
              expectedAmount={formatCurrency((metrics.active_members || 0) * (currentSacco?.cash_round_amount ? parseFloat(currentSacco.cash_round_amount) : 0))}
              membersPaid={0}
              totalMembers={metrics.active_members || 0}
            />
          </div>

          {/* Recent Activity placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-gray-500 text-center py-8">
                Recent activity will appear here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
