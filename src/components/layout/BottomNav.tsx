import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Store } from 'lucide-react';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home,
  },
  { 
    name: 'Cash Round', 
    href: '/cash-rounds', 
    icon: Calendar,
  },
  { 
    name: 'Business', 
    href: '/business', 
    icon: Store,
  },
  { 
    name: 'Members', 
    href: '/members', 
    icon: Users,
  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon size={24} />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
