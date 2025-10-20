import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { useCreateMeeting, useCashRoundSchedule } from '../../hooks/useMeetings';
import { useMembers } from '../../hooks/useMembers';
import { Input, Button, Card, CardBody, CardHeader, CardTitle } from '../../components/common';
import { getErrorMessage, isRequired } from '../../utils/validation';

export default function CreateMeeting() {
  const navigate = useNavigate();
  const createMeeting = useCreateMeeting();
  const { data: schedule } = useCashRoundSchedule();
  const { data: activeMembers = [] } = useMembers({ status: 'active' });

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const currentWeek = Math.ceil((new Date().getDate()) / 7);

  const [formData, setFormData] = useState({
    meeting_date: today,
    week_number: currentWeek,
    year: currentYear,
    cash_round_recipient: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get next recipient from schedule
  const nextRecipient = schedule?.next_recipient;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(formData.meeting_date)) {
      newErrors.meeting_date = getErrorMessage('Meeting date', 'required');
    }

    if (!formData.week_number || formData.week_number < 1) {
      newErrors.week_number = getErrorMessage('Week number', 'required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const meeting = await createMeeting.mutateAsync({
        sacco: 0, // Will be set by hook
        meeting_date: formData.meeting_date,
        week_number: formData.week_number,
        year: formData.year,
        cash_round_recipient: formData.cash_round_recipient
          ? parseInt(formData.cash_round_recipient)
          : nextRecipient?.id,
        status: 'in_progress',
      });

      // Navigate to collection interface
      navigate(`/meetings/${meeting.id}/collect`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/meetings">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Weekly Meeting</h1>
          <p className="text-gray-600 mt-1">Set up a new collection meeting</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Meeting Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Meeting Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Meeting Date"
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meeting_date: e.target.value }))
                  }
                  error={errors.meeting_date}
                  required
                  leftIcon={<Calendar size={18} />}
                />

                <Input
                  label="Week Number"
                  type="number"
                  value={formData.week_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      week_number: parseInt(e.target.value),
                    }))
                  }
                  error={errors.week_number}
                  required
                  min={1}
                  max={52}
                />

                <Input
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, year: parseInt(e.target.value) }))
                  }
                  required
                  min={2020}
                  max={2030}
                />
              </div>

              {/* Cash Round Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Round Recipient
                </label>
                <select
                  value={formData.cash_round_recipient}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cash_round_recipient: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {nextRecipient && (
                    <option value="">
                      {nextRecipient.first_name} {nextRecipient.last_name} (Next in rotation)
                    </option>
                  )}
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} - #{member.member_number}
                    </option>
                  ))}
                </select>
                {nextRecipient && (
                  <p className="mt-1 text-sm text-gray-500">
                    <Users size={14} className="inline mr-1" />
                    {nextRecipient.first_name} {nextRecipient.last_name} is next in the cash round rotation
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll be taken to the collection interface</li>
                  <li>• Record contributions from each member</li>
                  <li>• Track attendance and payments in real-time</li>
                  <li>• Finalize the meeting to create passbook entries</li>
                </ul>
              </div>
            </div>
          </CardBody>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex gap-3 justify-end">
              <Link to="/meetings">
                <Button
                  type="button"
                  variant="outline"
                  disabled={createMeeting.isPending}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={createMeeting.isPending}
              >
                Start Collection
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
