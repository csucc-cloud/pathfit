import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { 
  Search, 
  UserPlus, 
  GraduationCap,
  ChevronRight,
  Loader2,
  Database,
  AlertCircle
} from 'lucide-react';

export default function ClassesPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // 1. INITIAL FETCH & REAL-TIME SYNC
  useEffect(() => {
    fetchSections();

    // Set up Real-time subscription to prevent ghost data
    const channel = supabase
      .channel('sections-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, () => {
        fetchSections(); // Re-fetch data whenever any change occurs in the DB
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSections = async () => {
    try {
      setError(null);
      
      // Get the current logged-in instructor's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      // Fetch only sections belonging to this instructor
      const { data, error: dbError } = await supabase
        .from('sections')
        .select(`
          *,
          students:profiles(count)
        `)
        .eq('instructor_id', user.id) // Filter by owner to prevent data leaks
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
    <InstructorLayout>
      {/* HEADER AREA */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter">
            Class <span className="text-fbOrange">Management</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-2 w-2 rounded-full ${loading ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`} />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Database size={12} /> {loading ? 'Checking Sync...' : 'Live Database Link Established'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-fbOrange transition-colors" />
            <input 
              type="text"
              placeholder="Filter by Section Code..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-fbNavy outline-none focus:ring-4 focus:ring-fbOrange/5 focus:border-fbOrange/20 transition-all shadow-sm uppercase placeholder:normal-case"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-600 mb-8">
          <AlertCircle />
          <p className="text-xs font-bold uppercase italic tracking-tight">Sync Error: {error}</p>
        </div>
      )}

      {/* DATA DISPLAY */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <Loader2 className="animate-spin text-fbNavy mb-4" size={40} />
          <p className="font-black uppercase italic tracking-tighter">Verifying Roster...</p>
        </div>
      ) : sections.length === 0 ? (
        /* EMPTY STATE: No Ghost Data, truly empty */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[45px] border-2 border-dashed border-gray-100">
          <div className="p-6 bg-fbGray/10 rounded-full mb-4">
            <GraduationCap size={40} className="text-gray-300" />
          </div>
          <h3 className="font-black text-fbNavy uppercase italic text-xl">No Sections Found</h3>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Start by deploying your first section</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sections
            .filter(s => s.section_code.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </InstructorLayout>
  );
}

function SectionCard({ section }) {
  // We extract count safely from the joined profiles query
  const studentCount = section.students?.[0]?.count || 0;

  return (
    <div className="bg-white rounded-[45px] p-8 border border-gray-50 border-b-4 border-b-fbOrange/10 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-fbOrange/5 rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-fbNavy rounded-2xl flex items-center justify-center shadow-lg mb-8 group-hover:bg-fbOrange transition-colors">
          <GraduationCap className="text-white" size={24} />
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-black text-fbNavy uppercase italic tracking-tighter mb-1 leading-none">
            {section.section_code}
          </h3>
          <p className="text-[10px] font-bold text-fbOrange uppercase tracking-widest mb-4">
            {section.course_name}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase">
              <span className="w-4 h-[1px] bg-gray-200" />
              <span>{section.schedule}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase">
              <span className="w-4 h-[1px] bg-gray-200" />
              <span className={studentCount > 0 ? "text-fbNavy" : ""}>
                {studentCount} Enrolled Athletes
              </span>
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-fbGray/10 hover:bg-fbNavy hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95">
          View Master Roster
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
