import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMember, useDeleteMember } from '../../hooks/useMembers';
import { useState } from 'react';
import { formatCurrency, parseDecimal } from '../../utils/format';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: member, isLoading, error } = useMember(parseInt(id!));
  const deleteMember = useDeleteMember();


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMember.mutateAsync(parseInt(id!));
      navigate('/members');
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Member not found</p>
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {member.first_name} {member.last_name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Member #{member.member_number}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/members/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Member Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center">
            {member.profile_picture ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={member.profile_picture}
                alt={`${member.first_name} ${member.last_name}`}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-semibold">
                {member.first_name?.[0] || '?'}{member.last_name?.[0] || ''}
              </div>
            )}
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              {member.first_name} {member.last_name}
            </h2>
            <span className={`mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
              {member.status}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase">Member Number</p>
              <p className="text-sm font-medium text-gray-900">{member.member_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Date Joined</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(member.date_joined)}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <p className="text-sm font-medium text-gray-900">{member.phone}</p>
            </div>
            {member.email && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-sm font-medium text-gray-900">{member.email}</p>
              </div>
            )}
            {member.address && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Address</p>
                <p className="text-sm font-medium text-gray-900">{member.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(member.total_savings)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Shares</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(member.total_shares)}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(parseDecimal(member.total_savings) + parseDecimal(member.total_shares))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <p className="text-sm text-gray-500">Transaction history coming soon...</p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Member</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {member.first_name} {member.last_name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMember.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMember.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
