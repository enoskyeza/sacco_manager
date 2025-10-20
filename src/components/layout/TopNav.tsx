import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSacco } from '../../hooks/useSacco';
import { getInitials } from '../../utils/format';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { user, logout } = useAuth();
  const { currentSacco, saccos, switchSacco } = useSacco();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSaccoMenu, setShowSaccoMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">SACCO</span>
            </Link>
          </div>

          {/* Center: SACCO Selector (desktop) */}
          {saccos.length > 1 && (
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowSaccoMenu(!showSaccoMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span>{currentSacco?.name || 'Select SACCO'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSaccoMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSaccoMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    {saccos.map((sacco) => (
                      <button
                        key={sacco.id}
                        onClick={() => {
                          switchSacco(sacco.id);
                          setShowSaccoMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          currentSacco?.id === sacco.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                        }`}
                      >
                        {sacco.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Right: User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getInitials(user?.first_name, user?.last_name)}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.first_name} {user?.last_name}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
