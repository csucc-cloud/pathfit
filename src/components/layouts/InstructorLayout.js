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
  
  // High-End UX: Close sidebar on route change automatically
  useEffect(() => {
    const handleRouteChange = () => setIsSidebarOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

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
      console.error('Error:', err.message);
      alert('Error signing out.');
    }
  };

  const isActive = (path) => {
    if (path === '/admin') return router.pathname === '/admin';
    return router.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#F8F9FD] font-sans selection:bg-fbOrange/30 overflow-x-hidden">
      
      {/* MOBILE TOP BAR (Landscape Optimized) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 md:h-20 bg-fbNavy/95 backdrop-blur-2xl flex items-center justify-between px-4 md:px-8 z-[60] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-fbOrange rounded-xl flex items-center justify-center shadow-lg shadow-fbOrange/30">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h2 className="font-black italic text-white uppercase tracking-tighter text-base md:text-xl">PATHFIT</h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 rounded-xl text-fbOrange active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE OVERLAY (Interactive Blur) */}
      <div 
        className={`fixed inset-0 bg-fbNavy/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-500 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* SIDEBAR (Responsive Mobile Portrait/Landscape) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] md:w-72 bg-fbNavy text-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:sticky lg:h-screen
      `}>
        {/* SIDEBAR HEADER */}
        <div className="p-8 md:p-10 flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 bg-fbOrange rounded-xl flex items-center justify-center shadow-xl shadow-fbOrange/40 transform -rotate-3">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black italic tracking-tighter text-2xl uppercase leading-none">
              PATH<span className="text-fbOrange">FIT</span>
            </h2>
            <span className="text-[9px] opacity-40 font-black uppercase mt-1 tracking-widest">Admin Portal</span>
          </div>
        </div>

        {/* NAVIGATION AREA (Scrollable for Landscape) */}
        <nav className="flex-1 px-4 md:px-6 space-y-2 md:space-y-3 mt-4 overflow-y-auto custom-scrollbar pb-6">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`group relative w-full flex items-center gap-4 px-5 py-3.5 md:py-4 rounded-2xl font-black text-[12px] md:text-[13px] uppercase tracking-widest transition-all duration-300 ${
                  active 
                  ? 'bg-fbOrange text-white shadow-xl shadow-fbOrange/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {active && (
                  <div className="absolute left-0 w-1 h-5 bg-white rounded-full -translate-x-1 animate-pulse" />
                )}
                <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 text-fbOrange'}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* SIGN OUT AREA */}
        <div className="p-6 md:p-8 mt-auto border-t border-white/5 shrink-0">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`
        flex-1 flex flex-col min-w-0 transition-all duration-500
        pt-20 md:pt-28 lg:pt-0 
        h-[100dvh] overflow-y-auto
      `}>
        {/* Responsive Content Container */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 md:py-12">
          {/* Page Entrance Animation Wrapper */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            {children}
          </div>
        </div>
      </main>

      {/* Global CSS for scrollbar containment */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @media (max-height: 500px) and (orientation: landscape) {
          nav { padding-bottom: 100px; }
        }
      `}</style>
    </div>
  );
}
