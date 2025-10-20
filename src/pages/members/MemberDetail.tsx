import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMember, useDeleteMember } from '../../hooks/useMembers';
import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import { passbookApi } from '../../api';
import { useSacco } from '../../hooks/useSacco';
import type { PassbookSection, PassbookEntry } from '../../types';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sections, setSections] = useState<PassbookSection[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [entries, setEntries] = useState<PassbookEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const { data: member, isLoading, error } = useMember(parseInt(id!));
  const deleteMember = useDeleteMember();
  const { currentSacco } = useSacco();


  // Fetch passbook sections
  useEffect(() => {
    const fetchSections = async () => {
      if (currentSacco) {
        try {
          const data = await passbookApi.getSections(currentSacco.id);
          setSections(data);
          if (data.length > 0) {
            setActiveTab(data[0].id);
          }
        } catch (err) {
          console.error('Failed to fetch sections:', err);
        }
      }
    };
    fetchSections();
  }, [currentSacco]);

  // Fetch entries for active tab
  useEffect(() => {
    const fetchEntries = async () => {
      if (activeTab && member) {
        setLoadingEntries(true);
        try {
          const response = await passbookApi.getEntries({
            section: activeTab,
            member: member.id,
          });
          // Handle paginated response
          if (response && typeof response === 'object') {
            if ('results' in response && Array.isArray(response.results)) {
              setEntries(response.results);
            } else if (Array.isArray(response)) {
              setEntries(response);
            } else {
              setEntries([]);
            }
          } else {
            setEntries([]);
          }
        } catch (err) {
          console.error('Failed to fetch entries:', err);
          setEntries([]);
        } finally {
          setLoadingEntries(false);
        }
      }
    };
    fetchEntries();
  }, [activeTab, member]);

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
          </div>
        </div>
      </div>

      {/* Passbook Transactions by Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Passbook Transactions</h3>
        </div>
        
        {/* Section Tabs */}
        {sections.length > 0 ? (
          <>
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === section.id
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Transactions Table */}
            <div className="p-6">
              {loadingEntries ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : entries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(entry.transaction_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entry.transaction_type === 'credit'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.transaction_type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${
                            entry.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                            {formatCurrency(entry.balance_after)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found for this section</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-6">
            <p className="text-sm text-gray-500">No passbook sections available</p>
          </div>
        )}
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
