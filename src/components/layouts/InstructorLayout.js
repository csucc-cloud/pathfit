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
  X,
  Copyright,
  HelpCircle
} from 'lucide-react';

export default function InstructorLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
    }
  };

  const isActive = (path) => {
    if (path === '/admin') return router.pathname === '/admin';
    return router.pathname.startsWith(path);
  };

  return (
    <div className="flex h-[100dvh] bg-[#F8F9FD] font-sans selection:bg-fbOrange/30 overflow-hidden">
      
      {/* MOBILE TOP BAR - Fixed Height & High Z-Index */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 md:h-20 bg-fbNavy/95 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 z-[60] border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-fbOrange rounded-xl flex items-center justify-center shadow-lg shadow-fbOrange/30">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h2 className="font-black italic text-white uppercase tracking-tighter text-lg">PATHFIT</h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl text-fbOrange transition-all active:scale-90"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      <div 
        className={`fixed inset-0 bg-fbNavy/80 backdrop-blur-md z-[45] lg:hidden transition-opacity duration-500 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* SIDEBAR - Structured to never hide the Sign Out button */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] bg-fbNavy text-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full lg:translate-x-0'}
        lg:sticky lg:h-screen
      `}>
        {/* LOGO AREA - Fixed */}
        <div className="p-10 flex items-center gap-4 shrink-0">
          <div className="w-11 h-11 bg-fbOrange rounded-2xl flex items-center justify-center shadow-2xl shadow-fbOrange/40 transform -rotate-6">
            <Zap size={24} className="text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black italic tracking-tighter text-2xl uppercase leading-none">
              PATH<span className="text-fbOrange">FIT</span>
            </h2>
            <span className="text-[10px] opacity-50 font-black uppercase mt-1 tracking-[0.2em]">Instructor</span>
          </div>
        </div>

        {/* NAVIGATION AREA - Scrollable Middle */}
        <nav className="flex-1 min-h-0 px-6 mt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-3 pb-10">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`group relative w-full flex items-center gap-4 px-6 py-4 rounded-[20px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 ${
                    active 
                    ? 'bg-fbOrange text-white shadow-xl shadow-fbOrange/30 translate-x-1' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-fbOrange'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {active && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* SIGN OUT AREA - Locked at bottom with shrink-0 */}
        <div className="p-8 border-t border-white/5 bg-fbNavy shrink-0 mt-auto">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-6 py-5 rounded-[20px] font-black text-[12px] uppercase tracking-widest text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-500 relative h-[100dvh] overflow-y-auto bg-[#F8F9FD]">
        <div className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-10 pt-28 lg:pt-14">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            {children}
          </div>
        </div>

        {/* REFINED FOOTER */}
        <footer className="w-full border-t border-slate-200/60 bg-white/80 backdrop-blur-md py-8 px-10 mt-auto shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 text-slate-400 order-2 md:order-1">
              <Copyright size={16} />
              <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                2026 PATHFIT • EDUOS SYSTEM
              </span>
            </div>
            
            <div className="flex items-center gap-8 order-1 md:order-2">
              <button className="text-[11px] font-black text-slate-500 hover:text-fbOrange transition-colors uppercase tracking-widest">Privacy</button>
              <button className="text-[11px] font-black text-slate-500 hover:text-fbOrange transition-colors uppercase tracking-widest">Support</button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">v2.4.0 PRIME</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @media (max-height: 600px) and (orientation: landscape) {
          .p-10 { padding: 1.5rem !important; }
          nav { margin-top: 0.5rem !important; }
          .pb-10 { padding-bottom: 5rem !important; }
        }
      `}</style>
    </div>
  );
}
