// src/components/Layout.jsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const Layout = ({ children }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Practicum 1', path: '/practicum/1', icon: '🏆' },
    { name: 'Practicum 2', path: '/practicum/2', icon: '🥈' },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-fbGray text-fbNavy">
      {/* Navigation Sidebar */}
      <aside className="w-64 bg-fbNavy text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          {/* Brand Logo - Firebase Orange Style */}
          <div className="w-8 h-8 bg-fbOrange rounded-lg rotate-3 shadow-lg shadow-fbOrange/20 flex items-center justify-center font-bold text-white">
            P
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            PATHFit <span className="text-fbAmber">Pro</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = router.asPath === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                  isActive 
                    ? 'bg-fbOrange text-white shadow-lg shadow-fbOrange/30' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}>
                  <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 text-gray-400 p-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-bold text-sm"
          >
            <span>🚪</span> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container - Adjusted for Sidebar Width */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header (Only visible on small screens) */}
        <header className="md:hidden bg-fbNavy p-4 flex justify-between items-center text-white sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-fbOrange rounded rotate-3 shadow-md"></div>
            <h1 className="font-black text-sm uppercase tracking-tighter">PATHFit Pro</h1>
          </div>
          <button className="p-2 bg-white/5 rounded-lg">
            <span className="text-xl">≡</span>
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
