import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Member, CreateMemberRequest, UpdateMemberRequest } from '../../types';
import { useCreateMember, useUpdateMember } from '../../hooks/useMembers';
import { Input, Button, Card, CardBody, CardFooter } from '../common';
import { isValidEmail, isValidPhone, isRequired, getErrorMessage } from '../../utils/validation';

interface MemberFormProps {
  member?: Member;
  onSuccess?: () => void;
}

export default function MemberForm({ member, onSuccess }: MemberFormProps) {
  const navigate = useNavigate();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEdit = !!member;

  const [formData, setFormData] = useState<CreateMemberRequest>({
    user_id: member?.user_id || 0,
    member_number: member?.member_number || '',
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    address: member?.address || '',
    date_joined: member?.date_joined || new Date().toISOString().split('T')[0],
    id_number: member?.id_number || '',
    alternative_phone: member?.alternative_phone || '',
    next_of_kin_name: member?.next_of_kin_name || '',
    next_of_kin_phone: member?.next_of_kin_phone || '',
    next_of_kin_relationship: member?.next_of_kin_relationship || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Only first_name is required
    if (!isRequired(formData.first_name)) {
      newErrors.first_name = getErrorMessage('First name', 'required');
    }

    // Validate phone if provided
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = getErrorMessage('Phone', 'phone');
    }

    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = getErrorMessage('Email', 'email');
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
      if (isEdit) {
        await updateMember.mutateAsync({
          memberId: member.id,
          data: formData as UpdateMemberRequest,
        });
        toast.success('Member updated successfully');
      } else {
        const response = await createMember.mutateAsync(formData);
        
        // Show success with generated credentials
        if (response && response.credentials) {
          toast.success(
            <div>
              <div className="font-semibold">Member created successfully!</div>
              <div className="mt-2 text-sm space-y-1">
                <div><strong>Username:</strong> {response.credentials.username}</div>
                <div><strong>Password:</strong> {response.credentials.password}</div>
                <div className="text-xs mt-2 text-gray-600">
                  {response.instructions}
                </div>
              </div>
            </div>,
            { duration: 10000 }
          );
        } else {
          toast.success('Member created successfully');
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/members');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save member';
      toast.error(errorMessage);
    }
  };

  const handleChange = (field: keyof CreateMemberRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardBody>
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  error={errors.first_name}
                  required
                  leftIcon={<User size={18} />}
                />

                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  error={errors.last_name}
                  leftIcon={<User size={18} />}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail size={18} />}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="+256700000000"
                  leftIcon={<Phone size={18} />}
                />

                <Input
                  label="Alternative Phone"
                  type="tel"
                  value={formData.alternative_phone}
                  onChange={(e) => handleChange('alternative_phone', e.target.value)}
                  placeholder="+256700000000"
                  leftIcon={<Phone size={18} />}
                />

                <Input
                  label="ID Number"
                  value={formData.id_number}
                  onChange={(e) => handleChange('id_number', e.target.value)}
                />

                <Input
                  label="Date Joined"
                  type="date"
                  value={formData.date_joined}
                  onChange={(e) => handleChange('date_joined', e.target.value)}
                  error={errors.date_joined}
                  leftIcon={<Calendar size={18} />}
                />

                {isEdit && (
                  <Input
                    label="Member Number"
                    value={formData.member_number}
                    disabled
                  />
                )}
              </div>

              <div className="mt-4">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  leftIcon={<MapPin size={18} />}
                />
              </div>
            </div>

            {/* Next of Kin */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next of Kin</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={formData.next_of_kin_name}
                  onChange={(e) => handleChange('next_of_kin_name', e.target.value)}
                  leftIcon={<User size={18} />}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.next_of_kin_phone}
                  onChange={(e) => handleChange('next_of_kin_phone', e.target.value)}
                  placeholder="+256700000000"
                  leftIcon={<Phone size={18} />}
                />

                <Input
                  label="Relationship"
                  value={formData.next_of_kin_relationship}
                  onChange={(e) => handleChange('next_of_kin_relationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/members')}
              disabled={createMember.isPending || updateMember.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMember.isPending || updateMember.isPending}
            >
              {isEdit ? 'Update Member' : 'Create Member'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
