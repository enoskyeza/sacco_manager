import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSacco } from '../../hooks/useSacco';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saccoApi } from '../../api/sacco';
import { formatCurrency } from '../../utils/format';
import { Button, Card, CardBody, CardHeader, CardTitle, Input } from '../../components/common';
import { Save, Building2, Mail, Phone, MapPin, Calendar, DollarSign, Receipt, RotateCw, Wallet, Store } from 'lucide-react';
import { toast } from 'sonner';
import type { UpdateSaccoRequest, DayOfWeek } from '../../types';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function Settings() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateSaccoRequest>({
    name: '',
    registration_number: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    cash_round_amount: '',
    meeting_day: 'Saturday',
  });

  // Populate form with current SACCO data
  useEffect(() => {
    if (currentSacco) {
      setFormData({
        name: currentSacco.name || '',
        registration_number: currentSacco.registration_number || '',
        description: currentSacco.description || '',
        email: currentSacco.email || '',
        phone: currentSacco.phone || '',
        address: currentSacco.address || '',
        cash_round_amount: currentSacco.cash_round_amount || '',
        meeting_day: currentSacco.meeting_day || 'Saturday',
      });
    }
  }, [currentSacco]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSaccoRequest) =>
      saccoApi.updateSacco(currentSacco!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sacco', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-saccos'] });
      toast.success('SACCO settings updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSacco) return;
    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof UpdateSaccoRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!currentSacco) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">No Group found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your Group organization settings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/settings/deduction-rules')}
            leftIcon={<Receipt size={18} />}
          >
            Deductions
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/settings/cash-round')}
            leftIcon={<RotateCw size={18} />}
          >
            Cash Round
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/settings/account')}
            leftIcon={<Wallet size={18} />}
          >
            Group Account
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/settings/businesses')}
            leftIcon={<Store size={18} />}
          >
            Businesses
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-gray-600" />
                <span>Basic Information</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Group Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter Group name"
                required
                leftIcon={<Building2 size={18} />}
              />
              <Input
                label="Registration Number"
                value={formData.registration_number}
                onChange={(e) => handleChange('registration_number', e.target.value)}
                placeholder="Enter registration number"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of your Group"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-gray-600" />
                <span>Contact Information</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="group@example.com"
                leftIcon={<Mail size={18} />}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+256 700 000 000"
                leftIcon={<Phone size={18} />}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Physical address or location"
                leftIcon={<MapPin size={18} />}
              />
            </div>
          </CardBody>
        </Card>

        {/* Meeting Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-600" />
                <span>Meeting Configuration</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Day
                </label>
                <select
                  value={formData.meeting_day}
                  onChange={(e) => handleChange('meeting_day', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Day of the week for weekly meetings
                </p>
              </div>
              <Input
                label="Cash Round Amount"
                type="number"
                value={formData.cash_round_amount}
                onChange={(e) => handleChange('cash_round_amount', e.target.value)}
                placeholder="51000"
                min="0"
                step="1000"
                leftIcon={<DollarSign size={18} />}
                required
                helperText="Standard weekly contribution per member"
              />
            </div>
            {formData.cash_round_amount && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>Current Setting:</strong> Each member contributes{' '}
                  <strong>{formatCurrency(formData.cash_round_amount)}</strong> per week
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Subscription Info (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Plan
                </label>
                <p className="text-lg font-semibold capitalize text-gray-900">
                  {currentSacco.subscription_plan}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentSacco.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : currentSacco.subscription_status === 'trial'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {currentSacco.subscription_status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Members
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {currentSacco.member_count}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save size={18} />}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
