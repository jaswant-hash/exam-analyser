import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Upload, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload',    path: '/upload',    icon: Upload },
    { name: 'Analysis',  path: '/analysis',  icon: Activity },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const initial = user?.displayName?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || 'U';

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-x-0 rounded-none rounded-b-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-amber flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.5)]">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Exam<span className="glow-text">AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.name} to={item.path}
                  className={clsx(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-brand-amber bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User avatar / dropdown */}
          <div className="relative flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-sm">
                    {initial}
                  </div>
                  <span className="text-gray-300 text-sm font-medium max-w-[100px] truncate hidden sm:block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-52 rounded-2xl border border-white/10 bg-[#0f0f13]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/8">
                        <p className="text-white text-sm font-semibold truncate">{user.displayName || 'User'}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button
                onClick={() => navigate('/signin')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20"
              >
                <User size={14} /> Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Click outside to close */}
      {dropOpen && <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />}
    </nav>
  );
}
