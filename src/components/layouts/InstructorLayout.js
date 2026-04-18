import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient'; 
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BarChart, 
  Settings, 
  LogOut,
  Zap,
  Menu,
  X 
} from 'lucide-react';

export default function InstructorLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const menuItems = [
    { name: 'Ann. Feed', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'My Classes', icon: <Users size={20} />, path: '/admin/classes' },
    { name: 'Approvals', icon: <ClipboardCheck size={20} />, path: '/admin/approvals' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/admin/analytics' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login'); 
    } catch (err) {
      console.error('Error signing out:', err.message);
      alert('Error signing out. Please try again.');
    }
  };

  // HIGHEST UI/UX: Exact path matching for Overview to prevent double-activation
  const isActive = (path) => {
    if (path === '/admin') return router.pathname === '/admin';
    return router.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] font-sans selection:bg-fbOrange/30">
      
      {/* MOBILE TOP BAR (High-Fidelity Blur) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-fbNavy/95 backdrop-blur-xl flex items-center justify-between px-6 z-[60] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-fbOrange rounded-xl flex items-center justify-center shadow-lg shadow-fbOrange/30 border border-white/20">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <h2 className="font-black italic text-white uppercase tracking-tighter text-lg">PATHFIT</h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-fbOrange active:scale-90 transition-all border border-white/10"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-fbNavy/80 backdrop-blur-md z-[45] lg:hidden animate-in fade-in duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Refined Motion & Glassmorphism) */}
      <aside className={`
        fixed h-full z-50 w-72 bg-fbNavy text-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* SIDEBAR HEADER */}
        <div className="p-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-fbOrange rounded-xl flex items-center justify-center shadow-2xl shadow-fbOrange/40 border border-white/10 transform -rotate-3">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black italic tracking-tighter text-2xl uppercase text-white leading-none">
              PATH<span className="text-fbOrange">FIT</span>
            </h2>
            <span className="text-[10px] opacity-40 not-italic tracking-[0.2em] font-black uppercase mt-1">Admin Portal</span>
          </div>
        </div>

        {/* NAVIGATION AREA */}
        <nav className="flex-1 px-6 space-y-3 mt-6">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`group relative w-full flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 ${
                  active 
                  ? 'bg-fbOrange text-white shadow-xl shadow-fbOrange/25 translate-x-1' 
                  : 'text-white/40 hover:text-white hover:bg-white/5 hover:translate-x-1'
                }`}
              >
                {/* Active Indicator Line */}
                {active && (
                  <div className="absolute left-0 w-1.5 h-6 bg-white rounded-full -translate-x-3 animate-in fade-in zoom-in duration-500" />
                )}
                
                <span className={`transition-all duration-300 ${active ? 'text-white scale-110' : 'text-fbOrange opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* SIGN OUT AREA */}
        <div className="p-8 mt-auto border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-6 py-5 rounded-3xl font-black text-[13px] uppercase tracking-widest text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95 group border border-transparent hover:border-red-500/20"
          >
            <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA: UPDATED SPACING TO SOLVE OVERLAP */}
      <main className={`
        flex-1 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        lg:ml-72 pt-28 lg:pt-10 px-6 md:px-12 pb-12 w-full flex flex-col
      `}>
        {/* Dynamic Page Wrapper with Entrance Motion */}
        <div className="max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
          {children}
        </div>
      </main>
    </div>
  );
}
