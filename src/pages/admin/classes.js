import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Search, 
  UserPlus, 
  GraduationCap,
  ChevronRight,
  Loader2,
  Database,
  AlertCircle,
  Clock,
  Users,
  LayoutGrid,
  Sparkles,
  ArrowRightCircle
} from 'lucide-react';

export default function ClassesPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // 1. INITIAL FETCH & REAL-TIME SYNC
  useEffect(() => {
    fetchSections();

    // Set up Real-time subscription
    const channel = supabase
      .channel('sections-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, () => {
        fetchSections(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSections = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const { data, error: dbError } = await supabase
        .from('sections')
        .select(`
          *,
          students:profiles(count)
        `)
        .eq('instructor_id', user.id) 
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setSections(data || []);
    } catch (err) {
      console.error('Database Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-2">
      {/* HEADER AREA: Professional & Dynamic */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="text-fbOrange w-5 h-5" />
            <span className="text-[11px] font-black text-fbOrange uppercase tracking-[0.4em]">Academic Control</span>
          </div>
          <h1 className="text-5xl font-black text-fbNavy uppercase italic tracking-tighter leading-none">
            Class <span className="text-fbOrange">Management</span>
          </h1>
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-2.5 w-2.5 rounded-full ${loading ? 'bg-slate-200' : 'bg-green-500 animate-pulse'}`} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Database size={12} className={loading ? "text-slate-300" : "text-fbNavy"} /> 
              {loading ? 'Synchronizing Nodes...' : 'Live Neural Link Established'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-fbOrange transition-colors" />
            <input 
              type="text"
              placeholder="Search section code..."
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-black text-fbNavy outline-none focus:ring-8 focus:ring-fbNavy/5 focus:bg-white focus:border-fbNavy transition-all shadow-inner uppercase placeholder:normal-case placeholder:font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border-2 border-dashed border-red-200 p-8 rounded-[32px] flex items-center gap-6 text-red-600 mb-12 animate-bounce">
          <div className="bg-white p-3 rounded-2xl shadow-sm"><AlertCircle /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest">Database Sync Interrupted</p>
            <p className="text-sm font-bold opacity-80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* DATA DISPLAY */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative">
             <div className="absolute inset-0 bg-fbOrange/20 blur-2xl rounded-full animate-pulse" />
             <Loader2 className="animate-spin text-fbNavy relative z-10" size={48} />
          </div>
          <p className="font-black uppercase italic tracking-[0.3em] text-fbNavy mt-8 animate-pulse">Retrieving Roster Data...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[60px] border-2 border-dashed border-slate-100 shadow-inner">
          <div className="p-8 bg-slate-50 rounded-[35px] mb-6 relative">
            <GraduationCap size={56} className="text-slate-200" />
            <Sparkles className="absolute top-4 right-4 text-fbOrange w-6 h-6" />
          </div>
          <h3 className="font-black text-fbNavy uppercase italic text-2xl tracking-tighter">No Units Deployed</h3>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.25em] mt-3">Start by creating your first section in the dashboard</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
          {sections
            .filter(s => s.section_code.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({ section }) {
  const studentCount = section.students?.[0]?.count || 0;

  return (
    <div className="bg-white rounded-[50px] p-10 border border-slate-50 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(26,42,74,0.12)] hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-fbOrange/10 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div className="w-16 h-16 bg-fbNavy rounded-[24px] flex items-center justify-center shadow-xl shadow-fbNavy/20 group-hover:bg-fbOrange group-hover:rotate-6 transition-all duration-500">
            <GraduationCap className="text-white" size={28} />
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
             <div className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 border border-green-100">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
             </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-[2px] w-6 bg-fbOrange group-hover:w-12 transition-all duration-500" />
             <p className="text-[11px] font-black text-fbOrange uppercase tracking-[0.2em]">
               {section.course_name || "General Curriculum"}
             </p>
          </div>
          <h3 className="text-3xl font-black text-fbNavy uppercase italic tracking-tighter mb-6 leading-none group-hover:text-fbOrange transition-colors">
            {section.section_code}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
              <div className="p-2 bg-white rounded-xl shadow-sm"><Clock size={16} className="text-fbNavy" /></div>
              <div>
                <span className="text-[9px] font-black text-slate-300 uppercase block tracking-widest">Schedule</span>
                <span className="text-[11px] font-bold text-fbNavy uppercase">{section.schedule || "TBA"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
              <div className="p-2 bg-white rounded-xl shadow-sm"><Users size={16} className="text-fbOrange" /></div>
              <div>
                <span className="text-[9px] font-black text-slate-300 uppercase block tracking-widest">Population</span>
                <span className="text-[11px] font-bold text-fbNavy uppercase">
                  {studentCount} Enrolled Practitioners
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="relative z-10 w-full py-5 bg-fbNavy text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 overflow-hidden group/btn shadow-xl shadow-fbNavy/10 hover:shadow-fbOrange/20 active:scale-95">
        <span className="relative z-10">View Master Roster</span>
        <ArrowRightCircle size={18} className="relative z-10 group-hover/btn:translate-x-2 transition-transform" />
        <div className="absolute inset-0 bg-fbOrange translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300" />
      </button>
    </div>
  );
}
