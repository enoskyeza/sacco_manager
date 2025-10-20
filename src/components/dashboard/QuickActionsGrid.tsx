import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Calendar, DollarSign, FileText, Settings, BookOpen } from 'lucide-react';
import Card from '../common/Card';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Add Member',
    description: 'Register a new group member',
    href: '/members/new',
    icon: <UserPlus size={24} />,
    color: 'bg-indigo-500',
  },
  {
    title: 'Record Meeting',
    description: 'Create weekly meeting record',
    href: '/meetings/new',
    icon: <Calendar size={24} />,
    color: 'bg-green-500',
  },
  {
    title: 'New Loan',
    description: 'Process loan application',
    href: '/loans/new',
    icon: <DollarSign size={24} />,
    color: 'bg-yellow-500',
  },
  {
    title: 'Settings',
    description: 'Configure group settings',
    href: '/settings',
    icon: <Settings size={24} />,
    color: 'bg-blue-500',
  },
  {
    title: 'Passbooks',
    description: 'View member passbooks',
    href: '/passbook',
    icon: <BookOpen size={24} />,
    color: 'bg-purple-500',
  },
  {
    title: 'Reports',
    description: 'Generate financial reports',
    href: '/reports',
    icon: <FileText size={24} />,
    color: 'bg-gray-500',
  },
];

export default function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {quickActions.map((action) => (
        <Link key={action.title} to={action.href}>
          <Card hover className="h-full">
            <div className="p-4 text-center">
              <div className={`inline-flex p-3 rounded-lg ${action.color} mb-3`}>
                <div className="text-white">{action.icon}</div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
