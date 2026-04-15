import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Practicum 1', path: '/practicum/1', icon: '🏆' },
    { name: 'Practicum 2', path: '/practicum/2', icon: '🥈' },
  ];

  return (
    <div className="flex min-h-screen bg-fbGray">
      {/* Navigation Sidebar */}
      <aside className="w-64 bg-fbNavy text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-fbOrange rounded-lg rotate-3 shadow-lg"></div>
          <h1 className="text-xl font-bold tracking-tight">
            PATHFit <span className="text-fbAmber">Pro</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                router.pathname === item.path ? 'bg-fbOrange text-white' : 'hover:bg-white/5 text-gray-400'
              }`}>
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 text-gray-400 p-2 hover:text-white transition-colors">
            <span>🚪</span> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  );
};

export default Layout;
