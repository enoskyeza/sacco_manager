import { useState } from 'react';
import { Play, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cashRoundApi } from '../../api/cashRound';
import type { CashRound } from '../../api/cashRound';
import { useSacco } from '../../hooks/useSacco';

interface CashRoundActionButtonProps {
  cashRound: CashRound;
  lastMeetingCompleted?: boolean;
  hasNoMeetings?: boolean;
  onSuccess?: () => void;
}

export default function CashRoundActionButton({
  cashRound,
  lastMeetingCompleted = false,
  hasNoMeetings = true,
  onSuccess,
}: CashRoundActionButtonProps) {
  const { currentSacco } = useSacco();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartRound = async () => {
    if (!currentSacco?.id) return;

    setIsLoading(true);
    try {
      await cashRoundApi.startCashRound(currentSacco.id, cashRound.id);
      toast.success('Cash round started and first meeting created!');
      
      // Refresh the page or call callback
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to start cash round:', error);
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Failed to start cash round');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNextMeeting = async () => {
    if (!currentSacco?.id) return;

    setIsLoading(true);
    try {
      await cashRoundApi.startNextMeeting(currentSacco.id, cashRound.id);
      toast.success('Next meeting created successfully!');
      
      // Refresh the page or call callback
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create next meeting:', error);
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Failed to create next meeting');
    } finally {
      setIsLoading(false);
    }
  };

  // Status: Planned - Show "Start Cash Round" button
  if (cashRound.status === 'planned') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Start Cash Round
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Click the button below to activate this cash round and create the first meeting.
              The first member in the rotation will be the recipient.
            </p>
          </div>
          <button
            onClick={handleStartRound}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Play className="h-5 w-5" />
            {isLoading ? 'Starting...' : 'Start Cash Round'}
          </button>
        </div>
      </div>
    );
  }

  // Status: Active - Show "Start Next Meeting" button if appropriate
  if (cashRound.status === 'active') {
    const canStartNext = hasNoMeetings || lastMeetingCompleted;

    if (canStartNext) {
      return (
            <button
              onClick={handleStartNextMeeting}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              {isLoading ? 'Creating...' : 'Start Next Meeting'}
            </button>
      );
    }

    // Current meeting is still in progress
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm font-medium">
            Current meeting is in progress. Complete it to create the next meeting.
          </p>
        </div>
      </div>
    );
  }

  // Status: Completed - Show completion message
  if (cashRound.status === 'completed') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Cash Round Completed
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              This cash round has been completed. All meetings have finished.
              {cashRound.actual_end_date && (
                <span className="ml-1">
                  Ended on {new Date(cashRound.actual_end_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Status: Cancelled or other
  return null;
}
