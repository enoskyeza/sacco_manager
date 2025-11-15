import { Users, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useSacco } from '../../hooks/useSacco';
import { useCurrentMember } from '../../hooks/useCurrentMember';
import { dashboardApi } from '../../api';
import { formatCurrency, parseDecimal } from '../../utils/format';
import type { MemberPendingPayments } from '../../types';
import { Loading } from '../../components/common/Spinner';
import UpcomingMeetingCard from '../../components/dashboard/UpcomingMeetingCard';
import QuickActionsGrid from '../../components/dashboard/QuickActionsGrid';

export default function Dashboard() {
  const { user } = useAuth();
  const { currentSacco } = useSacco();
  const { data: currentMember } = useCurrentMember();

  // Use SACCO member role for secretary checks
  const isSecretary = !!(
    currentMember &&
    (currentMember.role?.toLowerCase().includes('secretary') ?? false)
  );

  // Temporary debugging log for role-based UI
  console.log('Dashboard user:', user);
  console.log('Dashboard member:', currentMember);
  console.log('Dashboard sacco role:', currentMember?.role, 'isSecretary:', isSecretary);

  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', currentSacco?.id],
    queryFn: () => dashboardApi.getDashboardMetrics(currentSacco!.id),
    enabled: !!currentSacco,
  });

  // Fetch pending payments for the current member (loans + weekly contributions)
  const { data: pendingPayments } = useQuery<MemberPendingPayments>({
    queryKey: ['pending-payments', currentSacco?.id, currentMember?.id],
    queryFn: () => dashboardApi.getMemberPendingPayments(currentSacco!.id, currentMember!.id),
    enabled: !!currentSacco && !!currentMember,
  });

  // Calculate savings goal progress
  const savingsGoal = currentMember?.savings_goal ? parseDecimal(currentMember.savings_goal) : null;
  const currentSavings = currentMember?.total_savings ? parseDecimal(currentMember.total_savings) : 0;
  const savingsProgress = savingsGoal && savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0;

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
          Here's what's happening with your Group today
        </p>
      </div>

      {/* Pending Payments Alert (only show when there are pending items) */}
      {pendingPayments?.has_pending && pendingPayments.items.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-red-500">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h2 className="text-sm md:text-base font-semibold text-red-800">
                  You have {pendingPayments.total_count} pending payment
                  {pendingPayments.total_count > 1 ? 's' : ''}
                </h2>
                <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  Due within 3 days or overdue
                </span>
              </div>
              <div className="space-y-1.5 text-xs md:text-sm text-red-800 max-h-40 overflow-y-auto">
                {pendingPayments.items.map((item) => {
                  if (item.type === 'loan') {
                    return (
                      <div
                        key={`loan-${item.loan_id}`}
                        className="flex justify-between items-center gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            Loan {item.loan_number} repayment
                          </p>
                          <p className="text-xs text-red-700 truncate">
                            Due {item.status === 'overdue' ? 'since' : 'by'}{' '}
                            {item.due_date} · {formatCurrency(item.amount_due)} outstanding
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${{
                            overdue: 'bg-red-600 text-white',
                            due_soon: 'bg-red-100 text-red-700',
                          }[item.status]}`}
                        >
                          {item.status === 'overdue'
                            ? 'Overdue'
                            : `Due in ${item.days_until_due} day${
                                item.days_until_due === 1 ? '' : 's'
                              }`}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`meeting-${item.meeting_id}`}
                      className="flex justify-between items-center gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          Weekly cash round contribution
                        </p>
                        <p className="text-xs text-red-700 truncate">
                          Week {item.week_number}
                          {item.cash_round_name ? ` · ${item.cash_round_name}` : ''} · Due{' '}
                          {item.status === 'overdue' ? 'since' : 'by'} {item.due_date} ·{' '}
                          {formatCurrency(item.amount_due)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${{
                          overdue: 'bg-red-600 text-white',
                          due_soon: 'bg-red-100 text-red-700',
                        }[item.status]}`}
                      >
                        {item.status === 'overdue'
                          ? 'Overdue'
                          : `Due in ${item.days_until_due} day${
                              item.days_until_due === 1 ? '' : 's'
                            }`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Savings Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-green-100 text-sm font-medium mb-1">My Savings</p>
              <p className="text-3xl font-bold">{formatCurrency(currentMember?.total_savings || '0')}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <PiggyBank size={28} />
            </div>
          </div>
          {savingsGoal && savingsGoal > 0 && (
            <div className="mt-3 pt-3 border-t border-green-400/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-100 text-xs">Progress</span>
                <span className="text-green-100 text-xs font-medium">{savingsProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100 text-xs">Goal: {formatCurrency(savingsGoal)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Total Members Card */}
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
        
        {/* Current Group Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Current Group Balance</p>
              <p className="text-4xl font-bold">{formatCurrency(metrics?.account_balance || '0')}</p>
              <p className="text-blue-100 text-sm mt-2">
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
        <QuickActionsGrid isSecretary={isSecretary} />
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
