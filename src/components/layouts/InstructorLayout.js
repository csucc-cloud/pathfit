import React, { useState } from 'react'; // Added useState for toggle logic
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
  Menu, // Added for mobile toggle
  X     // Added for mobile toggle
} from 'lucide-react';

export default function InstructorLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'My Classes', icon: <Users size={20} />, path: '/admin/classes' },
    { name: 'Approvals', icon: <ClipboardCheck size={20} />, path: '/admin/approvals' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/admin/analytics' },
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

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] font-sans">
      
      {/* MOBILE TOP BAR (Hidden on Desktop) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-fbNavy flex items-center justify-between px-6 z-[60] border-b border-white/5">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-fbOrange fill-fbOrange" />
          <h2 className="font-black italic text-white uppercase tracking-tighter text-sm">PATHFIT</h2>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-fbOrange/10 rounded-xl text-fbOrange active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE OVERLAY (Blur/Darken background when sidebar open) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-fbNavy/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed h-full z-50 w-64 bg-fbNavy text-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-fbOrange rounded-lg flex items-center justify-center shadow-lg shadow-fbOrange/20">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <h2 className="font-black italic tracking-tighter text-lg uppercase text-white">
            PATH<span className="text-fbOrange">FIT</span> <span className="text-[10px] block opacity-40 not-italic tracking-widest font-bold -mt-1">FACULTY</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.path);
                setIsSidebarOpen(false); // Auto-close on mobile after navigation
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${
                router.pathname === item.path 
                ? 'bg-fbOrange text-white shadow-lg shadow-fbOrange/20' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={router.pathname === item.path ? 'text-white' : 'text-fbOrange opacity-50 group-hover:opacity-100'}>
                {item.icon}
              </span>
              {item.name}
            </button>
          ))}
        </nav>

        {/* UPDATED SIGN OUT BUTTON */}
        <div className="p-6 mt-auto border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`
        flex-1 p-6 md:p-10 transition-all duration-500
        lg:ml-64 mt-16 lg:mt-0 w-full overflow-x-hidden
      `}>
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
