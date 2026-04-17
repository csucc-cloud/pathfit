import React from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient'; // Make sure this path is correct
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  BarChart, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';

export default function InstructorLayout({ children }) {
  const router = useRouter();
  
  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'My Classes', icon: <Users size={20} />, path: '/admin/classes' },
    { name: 'Approvals', icon: <ClipboardCheck size={20} />, path: '/admin/approvals' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/admin/analytics' },
  ];

  // LOGIC TO HANDLE LOGOUT
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to the login page (or home) after successful sign out
      router.push('/login'); 
    } catch (err) {
      console.error('Error signing out:', err.message);
      alert('Error signing out. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-fbNavy text-white flex flex-col fixed h-full z-50">
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
              onClick={() => router.push(item.path)}
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
        <div className="p-6 mt-auto">
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
      <main className="flex-1 ml-64 p-10">
        {children}
      </main>
    </div>
  );
}
