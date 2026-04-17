import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Trophy, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  User, 
  PanelLeftClose, 
  PanelLeftOpen,
  ClipboardCheck,
  History,
  Lock, 
  Activity,
  Sparkles, // Added for high-end UI feel
  Target
} from 'lucide-react';

// --- ADVANCED SKELETON UI (NO SPINNERS) ---
const UniversalSkeleton = () => (
  <div className="max-w-[1250px] mx-auto px-6 mt-8 space-y-10 animate-pulse">
    {/* Hero Section Skeleton */}
    <div className="h-56 md:h-72 w-full bg-gray-200/60 rounded-[2.5rem] border border-gray-100" />
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Stats Skeleton */}
      <div className="lg:col-span-4 space-y-6">
        <div className="h-40 w-full bg-gray-200/60 rounded-[2rem]" />
        <div className="h-80 w-full bg-gray-200/60 rounded-[2rem]" />
      </div>
      
      {/* Right Table/Content Skeleton */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-gray-200/60 rounded-full" />
          <div className="h-10 w-32 bg-gray-200/60 rounded-full" />
        </div>
        <div className="h-[500px] w-full bg-gray-200/60 rounded-[2.5rem]" />
      </div>
    </div>
  </div>
);

const Layout = ({ children }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fetch progress for UI state
  useEffect(() => {
    const checkProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('pre_test_completed')
          .eq('id', user.id)
          .single();
        
        if (data?.pre_test_completed) {
          setIsLocked(false);
        }
      }
    };
    checkProgress();
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requiresUnlock: false },
    { name: 'Student Profile', path: '/studprofile/profile', icon: User, requiresUnlock: false },
    { name: 'Initial Pre-Test', path: '/module/pre', icon: ClipboardCheck, requiresUnlock: false },
    { name: 'Weekly Logs', path: '/dashboard#logs', icon: Dumbbell, requiresUnlock: true }, 
    { name: 'Final Post-Test', path: '/module/post', icon: History, requiresUnlock: true },
  ];

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  // --- UPDATED NAVIGATION LOGIC ---
  useEffect(() => {
    setMounted(true);
    setIsMobileMenuOpen(false);
    
    // Only show skeleton on first mount, not on every route change
    // This prevents the "automatic refresh" feel when clicking sidebar items
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 450); 

    return () => clearTimeout(timer);
  }, []); // Empty dependency array means it only runs once on load

  // Handle closing mobile menu on route change without triggering skeleton
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-fbGray text-fbNavy font-sans selection:bg-fbOrange/20 overflow-x-hidden">
      
      {/* ADVANCED DESKTOP SIDEBAR */}
      <aside 
        className={`bg-fbNavy text-white hidden md:flex flex-col fixed h-full z-30 shadow-[10px_0_30px_rgba(0,0,0,0.05)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isSidebarCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-fbOrange to-orange-600 rounded-xl rotate-3 shadow-lg shadow-fbOrange/25 flex items-center justify-center font-black text-white transition-transform group-hover:rotate-0 group-hover:scale-110 duration-300">
                P
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tighter leading-none uppercase">
                  PATHFit <span className="text-fbAmber">Portal</span>
                </h1>
                <span className="text-[9px] font-bold text-fbOrange/60 tracking-[0.2em] uppercase mt-1">Academic Suite</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all ${isSidebarCollapsed ? 'mx-auto' : ''}`}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} className="text-fbOrange" /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        
        {/* Global Progress Widget (Advanced UI Element) */}
        {!isSidebarCollapsed && (
          <div className="px-8 mt-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-gray-500">Course Journey</span>
                <span className="text-[10px] font-black text-fbOrange">{isLocked ? '12%' : '45%'}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-fbOrange rounded-full transition-all duration-1000" style={{ width: isLocked ? '12%' : '45%' }} />
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1.5 mt-8 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const itemLocked = item.requiresUnlock && isLocked;
            const isActive = item.name === 'Dashboard' 
              ? router.asPath === '/dashboard' 
              : router.asPath === item.path;

            return (
              <Link 
                key={item.path} 
                href={itemLocked ? '#' : item.path}
                onClick={(e) => itemLocked && e.preventDefault()}
                className="block"
                {/* Prevent scrolling to top for hash links like #logs */}
                scroll={item.path.includes('#') ? false : true}
              >
                <div className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-fbOrange to-fbOrange/80 text-white shadow-xl shadow-fbOrange/20' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center' : ''} ${itemLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                  
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-transparent'}`}>
                    <Icon size={20} className={`${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <span className="font-bold text-[13px] tracking-wide flex-1">
                      {item.name}
                    </span>
                  )}

                  {itemLocked && !isSidebarCollapsed && <Lock size={12} className="opacity-40" />}
                  
                  {isActive && !isSidebarCollapsed && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  )}

                  {/* Tooltip for Collapsed Sidebar */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-20 bg-fbNavy border border-white/10 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none z-50 shadow-2xl">
                      {item.name} {itemLocked ? '🔒' : ''}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 text-gray-500 p-4 hover:bg-red-500/10 hover:text-red-400 rounded-[1.5rem] transition-all font-black text-xs group"
          >
            <div className={`p-2 rounded-xl ${isSidebarCollapsed ? 'mx-auto' : 'bg-white/5'}`}>
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            </div>
            {!isSidebarCollapsed && <span>End Session</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE GLASS HEADER */}
      <header className="md:hidden fixed top-0 w-full bg-fbNavy/80 backdrop-blur-xl p-4 flex justify-between items-center text-white z-40 border-b border-white/5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-fbOrange rounded-lg rotate-3 flex items-center justify-center font-black text-xs">P</div>
          <h1 className="font-black text-sm uppercase tracking-tighter">
            PATHFit <span className="text-fbAmber">Portal</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 bg-white/5 rounded-xl active:scale-90 transition-all"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-500 ${
        isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <div className="absolute inset-0 bg-fbNavy/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
        <nav className="relative w-[85%] h-full bg-fbNavy p-8 pt-24 space-y-6 shadow-2xl border-r border-white/5">
          <div className="mb-10">
            <span className="text-fbOrange text-[10px] font-black uppercase tracking-[0.3em]">Navigation</span>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const itemLocked = item.requiresUnlock && isLocked;
            const isActive = item.name === 'Dashboard' 
              ? router.asPath === '/dashboard' 
              : router.asPath === item.path;

            return (
              <Link 
                key={item.path} 
                href={itemLocked ? '#' : item.path}
                onClick={(e) => {
                  if(itemLocked) e.preventDefault();
                  else setIsMobileMenuOpen(false);
                }}
              >
                <div className={`flex items-center gap-5 p-5 rounded-[2rem] font-black transition-all ${
                  isActive ? 'bg-fbOrange text-white scale-[1.02]' : 'bg-white/5 text-white/50'
                } ${itemLocked ? 'opacity-30' : ''}`}>
                  <Icon size={24} className={isActive ? 'text-white' : 'text-fbOrange'} />
                  <span className="flex-1 tracking-tight text-base">{item.name}</span>
                  {itemLocked && <Lock size={16} />}
                </div>
              </Link>
            );
          })}
          <div className="pt-10 mt-10 border-t border-white/5">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-5 text-red-400 p-5 rounded-[2rem] bg-red-500/10 font-black"
            >
              <LogOut size={24} />
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT WITH TRANSITION WRAPPER */}
      <main 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-500 pt-20 md:pt-0 ${
          isSidebarCollapsed ? 'md:ml-24' : 'md:ml-72'
        }`}
      >
        <div className="flex-1 relative pb-10">
          {isPageLoading ? (
             <UniversalSkeleton />
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500 cubic-bezier(0, 0, 0.2, 1)">
              {children}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 107, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Layout;
