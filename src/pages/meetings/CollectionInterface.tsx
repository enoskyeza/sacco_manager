import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import {
  useMeeting,
  useMeetingContributions,
  useCreateContribution,
  useUpdateContribution,
  useDeleteContribution,
  useFinalizeMeeting,
} from '../../hooks/useMeetings';
import { useSacco } from '../../hooks/useSacco';
import { useCurrentMember } from '../../hooks/useCurrentMember';
import { formatCurrency } from '../../utils/format';
import { Button, Card, CardBody, CardHeader, CardTitle } from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import ContributionRow from '../../components/meetings/ContributionRow';

export default function CollectionInterface() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSacco } = useSacco();
  const { data: currentMember } = useCurrentMember();
  const meetingId = parseInt(id!, 10);

  // Fetch meeting data
  const { data: meeting, isLoading: meetingLoading } = useMeeting(meetingId);
  const {
    data: contributions = [],
    refetch: refetchContributions,
  } = useMeetingContributions(meetingId);
  const { data: members = [] } = useMembers({ status: 'active' });

  // Mutations
  const createContribution = useCreateContribution();
  const updateContribution = useUpdateContribution();
  const deleteContribution = useDeleteContribution();
  const finalizeMeeting = useFinalizeMeeting();

  const defaultContributionAmount = currentSacco?.cash_round_amount || '0';

  const isSecretary = !!(
    currentMember &&
    (currentMember.role?.toLowerCase().includes('secretary') ?? false)
  );

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalExpected: (members.length * parseFloat(defaultContributionAmount || '0')).toString(),
      totalCollected: contributions
        .reduce((sum, contribution) => sum + parseFloat(contribution.amount_contributed || '0'), 0)
        .toString(),
      membersPaid: contributions.length,
      totalMembers: members.length,
    };
  }, [contributions, members, defaultContributionAmount]);

  const progress = stats.totalMembers > 0
    ? (stats.membersPaid / stats.totalMembers) * 100
    : 0;

  const handleFinalizeMeeting = async () => {
    if (window.confirm('Finalize this week? This will create passbook entries and cannot be undone.')) {
      await finalizeMeeting.mutateAsync(meetingId);
      navigate('/meetings');
    }
  };

  if (meetingLoading) {
    return <Loading message="Loading meeting..." />;
  }

  if (!meeting) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Meeting not found</p>
          <Link to="/meetings" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = meeting.status === 'completed';
  const isMutating =
    createContribution.isPending || updateContribution.isPending || deleteContribution.isPending;

  const handleRecordContribution = async (memberId: number, amount?: string) => {
    const targetAmount = amount || defaultContributionAmount;
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      return;
    }

    const existing = contributions.find((contribution) => contribution.member === memberId);

    if (existing) {
      await updateContribution.mutateAsync({
        contributionId: existing.id,
        meetingId,
        data: {
          amount_contributed: targetAmount,
          was_present: true,
        },
      });
    } else {
      await createContribution.mutateAsync({
        meeting: meetingId,
        member: memberId,
        was_present: true,
        amount_contributed: targetAmount,
        optional_savings: '0',
      });
    }

    await refetchContributions();
  };

  const handleUndoContribution = async (memberId: number) => {
    const existing = contributions.find((contribution) => contribution.member === memberId);
    if (!existing) {
      return;
    }

    await deleteContribution.mutateAsync({
      contributionId: existing.id,
      meetingId,
    });

    await refetchContributions();
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/meetings">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Week {meeting.week_number} Collection
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(meeting.meeting_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {!isCompleted && isSecretary && (
          <Button
            variant="primary"
            leftIcon={<CheckCircle size={18} />}
            onClick={handleFinalizeMeeting}
            isLoading={finalizeMeeting.isPending}
            disabled={stats.membersPaid === 0}
          >
            Finalize Week
          </Button>
        )}
      </div>

      {/* Section Stats */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expected</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalExpected)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalCollected)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Members Paid</p>
              <p className="text-2xl font-bold text-indigo-600">
                {stats.membersPaid} / {stats.totalMembers}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-2xl font-bold text-blue-600">{progress.toFixed(0)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Collection Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Record Contributions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {members.map((member) => {
              const contribution = contributions.find((c) => c.member === member.id);
              const isRecipient = meeting.cash_round_recipient === member.id;

              return (
                <ContributionRow
                  key={member.id}
                  member={member}
                  expectedAmount={defaultContributionAmount}
                  contribution={contribution}
                  onRecord={(amount) => handleRecordContribution(member.id, amount)}
                  onUndo={() => handleUndoContribution(member.id)}
                  isPending={isMutating}
                  disabled={isCompleted}
                  isRecipient={isRecipient}
                  canEdit={isSecretary}
                />
              );
            })}

            {members.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No active members found
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
