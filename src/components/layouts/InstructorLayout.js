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
  MoreHorizontal,
  Bell,
} from 'lucide-react';

export default function InstructorLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleRouteChange = () => setIsSidebarOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  const menuItems = [
    { name: 'Ann. Feed',  icon: <LayoutDashboard size={17} />, path: '/admin' },
    { name: 'My Classes', icon: <Users size={17} />,           path: '/admin/classes' },
    { name: 'Approvals',  icon: <ClipboardCheck size={17} />,  path: '/admin/approvals' },
    { name: 'Analytics',  icon: <BarChart size={17} />,         path: '/admin/analytics' },
    { name: 'Settings',   icon: <Settings size={17} />,         path: '/admin/settings' },
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

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'IN';

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Instructor';

  return (
    <div className="flex h-[100dvh] w-full bg-[#EEF0F6] font-sans overflow-hidden">

      {/* ── MOBILE TOP BAR ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B1120]/95 backdrop-blur-xl flex items-center justify-between px-5 z-[60] border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-fbOrange rounded-lg flex items-center justify-center" style={{ transform: 'rotate(-6deg)' }}>
            <Zap size={15} className="text-white fill-white" />
          </div>
          <span className="font-black italic text-white uppercase tracking-tight text-base">
            PATH<span className="text-fbOrange">FIT</span>
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg text-fbOrange active:scale-90 transition-transform"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── OVERLAY ── */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0B1120] text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        lg:sticky lg:top-0 lg:h-screen
      `}>

        {/* Logo */}
        <div id="sidebar-logo" className="flex items-center gap-3 px-5 py-6 border-b border-white/5 shrink-0">
          <div
            id="sidebar-logo-icon"
            className="w-9 h-9 bg-fbOrange rounded-xl flex items-center justify-center shadow-lg shadow-fbOrange/30 shrink-0"
            style={{ transform: 'rotate(-6deg)' }}
          >
            <Zap size={18} className="text-white fill-white" />
          </div>
          <div>
            <p className="font-black italic tracking-tight text-xl uppercase leading-none">
              PATH<span className="text-fbOrange">FIT</span>
            </p>
            <p id="sidebar-logo-subtitle" className="text-[9px] text-white/30 font-semibold uppercase tracking-[0.18em] mt-0.5">
              Instructor Portal
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav id="sidebar-nav" className="flex-1 min-h-0 overflow-y-auto px-3 py-4 custom-scrollbar">
          <p className="text-[9px] text-white/25 font-bold uppercase tracking-[0.14em] px-3 mb-2">Menu</p>

          <div className="space-y-0.5" id="sidebar-nav-inner">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.name}
                  onClick={() => { router.push(item.path); setIsSidebarOpen(false); }}
                  className={`sidebar-nav-btn group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[12px] uppercase tracking-wider transition-all duration-200 ${
                    active
                      ? 'bg-fbOrange text-white shadow-lg shadow-fbOrange/20'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:text-fbOrange'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {active && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full opacity-80" />}
                </button>
              );
            })}
          </div>

          {/* Divider + Sign Out inside nav so it always scrolls into view */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[9px] text-white/25 font-bold uppercase tracking-[0.14em] px-3 mb-2">Account</p>
            <button
              onClick={handleSignOut}
              className="sidebar-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-[12px] uppercase tracking-wider text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
            >
              <LogOut size={17} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>
        </nav>

        {/* User card pinned to bottom */}
        <div className="px-3 pb-4 shrink-0 border-t border-white/5 pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-lg bg-fbOrange flex items-center justify-center text-[11px] font-black text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{displayName}</p>
              <p className="text-[9px] text-white/35 uppercase tracking-wide">Instructor</p>
            </div>
            <MoreHorizontal size={14} className="text-white/30 shrink-0" />
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      {/* Changed bg color here slightly to match dashboard or keep as is. Removed max-width constraints */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto bg-[#EEF0F6]">
        {/* UPDATED: Removed max-w-7xl and adjusted padding to maximize space */}
        <div className="flex-1 w-full max-w-none mx-auto px-0 py-0 pt-16 lg:pt-0">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both min-h-full">
            {children}
          </div>
        </div>

        {/* UPDATED: Removed max-w-7xl from footer for edge-to-edge look */}
        <footer className="w-full border-t border-slate-200/60 bg-white/70 backdrop-blur-md py-6 px-8 mt-auto shrink-0">
          <div className="max-w-none mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 order-2 sm:order-1">
              <Copyright size={13} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                2026 PATHFIT · Learning Management System
              </span>
            </div>
            <div className="flex items-center gap-6 order-1 sm:order-2">
              <button className="text-[10px] font-bold text-slate-400 hover:text-fbOrange transition-colors uppercase tracking-widest">Privacy</button>
              <button className="text-[10px] font-bold text-slate-400 hover:text-fbOrange transition-colors uppercase tracking-widest">Support</button>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">v2.4.0</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        html, body {
          height: 100%; margin: 0; padding: 0;
          overflow: hidden; position: fixed; width: 100%;
        }

        @media screen and (orientation: landscape) and (max-height: 500px) {
          #sidebar-logo { padding: 0.5rem 0.75rem !important; }
          #sidebar-logo-icon { width: 1.75rem !important; height: 1.75rem !important; }
          #sidebar-logo-subtitle { display: none !important; }
          #sidebar-nav { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
          .sidebar-nav-btn { padding-top: 0.35rem !important; padding-bottom: 0.35rem !important; }
        }
      `}</style>
    </div>
  );
}
