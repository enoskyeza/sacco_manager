import { Users, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { WeeklyMeeting } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Card, CardBody, MeetingStatusBadge } from '../common';

interface MeetingCardProps {
  meeting: WeeklyMeeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const totalMembers = meeting.members_present + meeting.members_absent;
  const membersPaid = meeting.members_present; // Members present are assumed to have paid
  const paymentRate = totalMembers > 0
    ? (membersPaid / totalMembers) * 100
    : 0;

  return (
    <Link to={`/meetings/${meeting.id}`}>
      <Card hover>
        <CardBody>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Week {meeting.week_number}, {meeting.year}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(meeting.meeting_date, 'long')}
                </p>
              </div>
              <MeetingStatusBadge status={meeting.status} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <DollarSign className="text-indigo-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Collected</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(meeting.total_collected)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="text-green-600" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Members Paid</p>
                  <p className="font-semibold text-gray-900">
                    {membersPaid}/{totalMembers}
                  </p>
                </div>
              </div>
            </div>

            {/* Cash Round Recipient */}
            {meeting.cash_round_recipient_name && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Cash Round Recipient</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {meeting.cash_round_recipient_name}
                  </p>
                  <p className="text-sm font-semibold text-indigo-600">
                    {formatCurrency(meeting.amount_to_recipient)}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Payment Progress</span>
                <span>{paymentRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${paymentRate}%` }}
                />
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">
                {meeting.status === 'completed' ? 'View details' : 'Continue collection'}
              </span>
              <ArrowRight size={18} className="text-gray-400" />
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
