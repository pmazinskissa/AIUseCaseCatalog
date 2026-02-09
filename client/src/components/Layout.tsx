import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  PlusCircle,
  Users,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ChevronRight,
  Bell,
  Search,
  Settings,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, description: 'Overview & analytics' },
    { path: '/submit', label: 'Submit Use Case', icon: PlusCircle, description: 'Add new entry' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin/tools', label: 'Manage Tools', icon: Wrench, description: 'AI tools library' });
    navItems.push({ path: '/admin', label: 'User Management', icon: Users, description: 'Manage users' });
  }

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Use Case Dashboard';
    if (location.pathname === '/submit') return 'Submit New Use Case';
    if (location.pathname === '/admin/tools') return 'Manage AI Tools';
    if (location.pathname === '/admin') return 'User Management';
    if (location.pathname.startsWith('/use-case/')) return 'Use Case Details';
    return 'AI Use Case Catalog';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/50 text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-full md:w-72'} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex-shrink-0 md:h-screen sticky top-0 z-20 transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/5 pointer-events-none" />

        {/* Logo/Header */}
        <div className={`relative p-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all group-hover:scale-105">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white whitespace-nowrap block">AI Use Cases</span>
                <span className="text-xs text-slate-400 font-medium">Enterprise Catalog</span>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/" className="relative group">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all group-hover:scale-105">
                <Sparkles size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </Link>
          )}
        </div>

        {/* Toggle Button */}
        <div className={`relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-end px-4'} py-2`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative p-3 space-y-1 flex-1">
          {!isCollapsed && (
            <div className="pb-3 pt-1 px-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Navigation</span>
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center px-3' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full" />
                )}
                <div className={`${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'} p-2 rounded-lg transition-all`}>
                  <Icon size={18} className="flex-shrink-0" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.label}</span>
                    {!isActive && (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate block">{item.description}</span>
                    )}
                  </div>
                )}
                {!isCollapsed && isActive && (
                  <ChevronRight size={16} className="text-cyan-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="relative p-4 space-y-3">
          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                <Settings size={14} />
                Settings
              </button>
            </div>
          )}

          {/* User Info */}
          <div className={`bg-gradient-to-br from-white/10 to-white/5 rounded-xl ${isCollapsed ? 'p-2' : 'p-3'} border border-white/10`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {(user?.name || user?.email || '?')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{user?.name || user?.email}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user?.role === 'ADMIN' ? 'bg-cyan-400' :
                      user?.role === 'COMMITTEE' ? 'bg-blue-400' : 'bg-slate-400'
                    }`} />
                    {user?.role}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen relative">
        {/* Header - hidden on dashboard */}
        {location.pathname !== '/' && (
          <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-10 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Breadcrumb-style title */}
              <h1 className="text-sm font-semibold text-slate-800">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer group">
                <Search size={16} className="text-slate-400 group-hover:text-slate-600" />
                <span className="text-sm text-slate-400 group-hover:text-slate-600">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white rounded border border-slate-200">
                  ⌘K
                </kbd>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              {/* User Avatar in Header */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {(user?.name || user?.email || '?')[0].toUpperCase()}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>

      </main>
    </div>
  );
}
