import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Bell, AlertCircle, Settings, LogOut, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/games', icon: Brain, label: 'Games' },
    { path: '/emergency', icon: AlertCircle, label: 'Help', className: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-600">Echo</span>Care
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 font-medium hidden sm:block">Hello, {user.name}</span>
          <button onClick={logout} className="p-2 text-slate-500 hover:text-slate-800">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full pb-safe">
        <div className="flex justify-around items-center h-16 max-w-5xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                } ${item.className || ''}`}
              >
                <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
}
