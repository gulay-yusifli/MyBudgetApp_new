import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaListAlt, FaTags, FaSignOutAlt, FaWallet, FaPiggyBank } from 'react-icons/fa';

const navItems = [
  { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { to: '/transactions', icon: <FaListAlt />, label: 'Transactions' },
  { to: '/categories', icon: <FaTags />, label: 'Categories' },
  { to: '/savings-goals', icon: <FaPiggyBank />, label: 'Savings Goals' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-white/10 backdrop-blur-sm border-r border-white/20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/20">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <FaWallet className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-lg">MyBudgetApp</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-white/20">
          {user.fullName && (
            <p className="text-white/60 text-xs px-2 mb-2 truncate">{user.fullName}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
          >
            <FaSignOutAlt className="text-base" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
