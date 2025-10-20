import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMember, useCreateMember, useUpdateMember } from '../../hooks/useMembers';
import { useState, useEffect, type FormEvent } from 'react';
import type { Status } from '../../types';

export default function MemberForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const { data: member, isLoading: loadingMember } = useMember(isEditing ? parseInt(id) : 0);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_joined: new Date().toISOString().split('T')[0],
    status: 'active' as Status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (member && isEditing) {
      setFormData({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email || '',
        phone: member.phone,
        address: member.address || '',
        date_joined: member.date_joined.split('T')[0],
        status: member.status,
      });
    }
  }, [member, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.date_joined) {
      newErrors.date_joined = 'Date joined is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateMember.mutateAsync({
          memberId: parseInt(id),
          data: formData,
        });
      } else {
        await createMember.mutateAsync(formData);
      }
      navigate('/members');
    } catch (error: unknown) {
      console.error('Failed to save member:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: Record<string, string[]> } };
        const serverErrors: Record<string, string> = {};
        if (err.response?.data) {
          Object.entries(err.response.data).forEach(([key, value]) => {
            serverErrors[key] = Array.isArray(value) ? value[0] : String(value);
          });
        }
        setErrors(serverErrors);
      }
    }
  };

  if (loadingMember && isEditing) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/members"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Members
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Member' : 'Add New Member'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0700123456"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="email@example.com"
              />
            </div>

            {/* Date Joined */}
            <div>
              <label htmlFor="date_joined" className="block text-sm font-medium text-gray-700 mb-1">
                Date Joined <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_joined"
                value={formData.date_joined}
                onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.date_joined ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date_joined && (
                <p className="mt-1 text-sm text-red-600">{errors.date_joined}</p>
              )}
            </div>

            {/* Status (only when editing) */}
            {isEditing && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter member's address"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link
              to="/members"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMember.isPending || updateMember.isPending}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMember.isPending || updateMember.isPending
                ? 'Saving...'
                : isEditing
                ? 'Update Member'
                : 'Add Member'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
