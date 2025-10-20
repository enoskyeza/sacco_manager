import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MemberForm from '../../components/members/MemberForm';

export default function CreateMember() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/members">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
          <p className="text-gray-600 mt-1">Register a new SACCO member</p>
        </div>
      </div>

      {/* Form */}
      <MemberForm />
    </div>
  );
}
