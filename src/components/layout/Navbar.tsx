import { useAuth } from '../../contexts/AuthContext';
import { useSacco } from '../../contexts/SaccoContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Download } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentSacco } = useSacco();
  const { promptInstall, canInstall, isInstalled } = useInstallPrompt();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const sacco = {
    name: currentSacco?.name || 'Loading...',
    logo: currentSacco?.logo_url || null,
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Truncate SACCO name to 20 characters
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  // Get SACCO initial
  const getSaccoInitial = () => {
    return sacco.name[0].toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
        {/* SACCO Logo and Name */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {sacco.logo ? (
            <img
              src={sacco.logo}
              alt={sacco.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base">
                {getSaccoInitial()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-gray-900 truncate" title={sacco.name}>
              {truncateName(sacco.name)}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Manager</p>
          </div>
        </div>

        {/* Desktop - User Avatar & Menu */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getUserInitials()}
              </span>
            </div>
            <span className="text-sm text-gray-700">
              {user?.first_name || user?.username}
            </span>
          </div>
          
          {!isInstalled && canInstall && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50"
            >
              <Download size={16} />
              Install App
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>

        {/* Mobile - User Avatar */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getUserInitials()}
              </span>
            </div>
          </button>

          {/* Mobile Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              />
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.first_name || user?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                {!isInstalled && canInstall && (
                  <button
                    onClick={() => {
                      promptInstall();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Install App</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
