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
  User, // For Profile
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardCheck,
  History,
  Lock, // Added Lock icon for visual feedback
  Loader2,
  Activity
} from 'lucide-react';

// --- UNIVERSAL SKELETON COMPONENT ---
const UniversalSkeleton = () => (
  <div className="max-w-[1250px] mx-auto px-4 mt-8 space-y-8 animate-pulse">
    <div className="h-48 md:h-64 w-full bg-gray-200 rounded-xl" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="h-32 w-full bg-gray-200 rounded-xl" />
        <div className="h-64 w-full bg-gray-200 rounded-xl" />
      </div>
      <div className="lg:col-span-8 space-y-4">
        <div className="h-12 w-1/3 bg-gray-200 rounded-lg" />
        <div className="h-96 w-full bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

const Layout = ({ children }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // State to handle locking logic
  const [isPageLoading, setIsPageLoading] = useState(true); // Skeleton State

  // Fetch progress to see if pre-test is done
  useEffect(() => {
    const checkProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
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

  // UPDATED: Added Profile and kept locked status for specific items
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

  useEffect(() => {
    setMounted(true);
    setIsMobileMenuOpen(false);
    
    // Trigger skeleton on every route change
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600); // 600ms is the "sweet spot" for smooth transitions

    return () => clearTimeout(timer);
  }, [router.asPath]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-fbGray text-fbNavy font-sans overflow-x-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={`bg-fbNavy text-white hidden md:flex flex-col fixed h-full z-30 shadow-xl transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10 overflow-hidden">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <div className="w-8 h-8 bg-fbOrange rounded-lg rotate-3 shadow-lg shadow-fbOrange/20 flex items-center justify-center font-bold text-white transition-transform hover:rotate-0">
                P
              </div>
              <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
                PATHFit <span className="text-fbAmber">Portal</span>
              </h1>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            title={isSidebarCollapsed ? "Open Sidebar" : "Close Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
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
              >
                <div className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group relative ${
                  isActive 
                    ? 'bg-fbOrange text-white shadow-lg shadow-fbOrange/30 translate-x-1' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                } ${isSidebarCollapsed ? 'justify-center' : ''} ${itemLocked ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                  <Icon className={`w-5 h-5 min-w-[20px] transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  
                  {!isSidebarCollapsed && (
                    <span className="font-bold text-sm tracking-tight animate-in slide-in-from-left-2 duration-300 text-nowrap">
                      {item.name}
                    </span>
                  )}

                  {/* Lock indicator for desktop */}
                  {!isSidebarCollapsed && itemLocked && <Lock size={14} className="ml-auto opacity-40" />}

                  {isSidebarCollapsed && (
                    <div className="absolute left-16 bg-fbNavy text-white text-xs font-bold px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 z-50 whitespace-nowrap">
                      {item.name} {itemLocked ? '(Locked)' : ''}
                    </div>
                  )}
                  
                  {!isSidebarCollapsed && isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 text-gray-400 p-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-bold text-sm group ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 min-w-[20px] group-hover:-translate-x-1 transition-transform" /> 
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 w-full bg-fbNavy p-4 flex justify-between items-center text-white z-40 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-fbOrange rounded rotate-3 shadow-md flex items-center justify-center text-[10px] font-bold">P</div>
          <h1 className="font-black text-sm uppercase tracking-tighter">
            PATHFit <span className="text-fbAmber">Pro</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 rounded-lg active:scale-90 transition-all"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-fbNavy/90 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        
        <nav className="relative w-4/5 h-full bg-fbNavy p-6 pt-24 space-y-4 shadow-2xl border-r border-white/10">
          <div className="mb-8 px-4">
            <p className="text-fbOrange text-[10px] font-black uppercase tracking-widest opacity-70">Main Navigation</p>
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
                onClick={(e) => itemLocked && e.preventDefault()}
              >
                <div className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                  isActive ? 'bg-fbOrange text-white shadow-lg shadow-fbOrange/20' : 'bg-white/5 text-white/70 hover:text-white'
                } ${itemLocked ? 'opacity-50' : ''}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-fbOrange'}`} />
                  <span className="flex-1">{item.name}</span>
                  {itemLocked && <Lock size={18} className="opacity-40" />}
                </div>
              </Link>
            );
          })}
          <div className="pt-8 mt-8 border-t border-white/10">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 text-red-400 p-4 rounded-2xl bg-red-500/10 font-bold active:scale-95 transition-all"
            >
              <LogOut size={24} />
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <main 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pt-16 md:pt-0 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="flex-1 relative">
          {isPageLoading ? (
             <UniversalSkeleton />
          ) : (
            <div className="animate-in fade-in duration-500">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;
