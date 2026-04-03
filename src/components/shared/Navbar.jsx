import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Upload, UserRound } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Analysis', path: '/analysis', icon: Activity },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-x-0 rounded-none rounded-b-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-amber flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.5)]">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Exam<span className="glow-text">AI</span>
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={clsx(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'text-brand-amber bg-white/5' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center">
            <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <UserRound className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
