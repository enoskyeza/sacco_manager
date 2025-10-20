import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useMember } from '../../hooks/useMembers';
import MemberForm from '../../components/members/MemberForm';
import { Loading } from '../../components/common/Spinner';

export default function EditMember() {
  const { id } = useParams<{ id: string }>();
  const { data: member, isLoading } = useMember(parseInt(id!));

  if (isLoading) {
    return <Loading message="Loading member..." />;
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Member not found</p>
        <Link to="/members" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/members/${id}`}>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
          <p className="text-gray-600 mt-1">
            Update information for {member.first_name} {member.last_name}
          </p>
        </div>
      </div>

      {/* Form */}
      <MemberForm member={member} />
    </div>
  );
}
