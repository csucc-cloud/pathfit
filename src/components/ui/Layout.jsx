import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children, title }) {
  const router = useRouter();

  const navItems = [
    { label: 'Profile', path: '/profile', icon: '👤' },
    { label: 'Pre-Test', path: '/phase/1-pre-test', icon: '🎯' },
    { label: 'Weekly', path: '/phase/2-weekly', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col">
      {/* Header */}
      <header className="bg-[#051e34] text-white p-4 sticky top-0 z-50 shadow-md border-b border-[#039be5]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#039be5] rounded-lg flex items-center justify-center font-black text-xs">P</div>
            <h1 className="font-bold tracking-tight text-lg">PATHFit <span className="text-[#039be5]">PRO</span></h1>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 font-mono">v1.0.4</span>
        </div>
      </header>

      {/* Dynamic Title */}
      {title && (
        <div className="bg-white border-b border-gray-200 px-4 py-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-[#051e34] uppercase tracking-tight">{title}</h2>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-32">
        {children}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path} className="flex flex-col items-center">
            <span className={`text-xl ${router.pathname === item.path ? 'scale-110' : 'opacity-40'}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${router.pathname === item.path ? 'text-[#039be5]' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
