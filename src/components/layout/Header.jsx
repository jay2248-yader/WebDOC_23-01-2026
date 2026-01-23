import { useAuthStore } from '../../store/authstore';
import { useNavigate } from 'react-router-dom';

export default function Header({ title = 'ໜ້າຫຼັກ' }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

      {/* Right Section - Icons & User Info */}
      <div className="flex items-center gap-6">
        {/* Notification Icons */}
        <button className="text-blue-500 hover:text-blue-600 transition-colors">
          <span className="text-2xl">💬</span>
        </button>
        <button className="text-blue-500 hover:text-blue-600 transition-colors">
          <span className="text-2xl">🔔</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <span className="text-xl">👤</span>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">@{user?.usercode || 'user'}</p>
              <p className="text-sm font-semibold text-gray-800">
                {user?.username || 'User'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
