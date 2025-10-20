import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import { formatDate } from '../../utils/format';

interface UpcomingMeetingCardProps {
  meetingDate: string;
  recipientName?: string;
  expectedAmount: string;
  membersPaid: number;
  totalMembers: number;
}

export default function UpcomingMeetingCard({
  meetingDate,
  recipientName,
  expectedAmount,
  membersPaid,
  totalMembers,
}: UpcomingMeetingCardProps) {
  const paymentPercentage = (membersPaid / totalMembers) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Meeting</CardTitle>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-4">
          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calendar className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Meeting Date</p>
              <p className="font-semibold text-gray-900">{formatDate(meetingDate, 'long')}</p>
            </div>
          </div>

          {/* Recipient */}
          {recipientName && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cash Round Recipient</p>
                <p className="font-semibold text-gray-900">{recipientName}</p>
              </div>
            </div>
          )}

          {/* Expected Amount */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Expected Collection</p>
            <p className="text-2xl font-bold text-gray-900">{expectedAmount}</p>
          </div>

          {/* Payment Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Members Paid</span>
              <span className="font-medium text-gray-900">
                {membersPaid} / {totalMembers}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${paymentPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{paymentPercentage.toFixed(0)}% complete</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link to="/meetings/new" className="flex-1">
              <Button variant="primary" className="w-full">
                Record Meeting
              </Button>
            </Link>
            <Link to="/meetings">
              <Button variant="outline">
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
