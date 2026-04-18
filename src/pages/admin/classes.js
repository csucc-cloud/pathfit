// src/pages/classes/index.js (or equivalent path)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Added for navigation
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRightCircle,
  LayoutDashboard 
} from 'lucide-react';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export default function ClassesPage() {
  const router = useRouter(); // Initialize router
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSections();

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

  const filteredSections = sections.filter(s => 
    s.section_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-12 lg:pt-8 pb-20 px-6 md:px-10 lg:pl-12 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* --- UPDATED BRANDED HEADER --- */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl shadow-fbNavy/5 border border-white mb-16"
      >
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ rotate: 0, scale: 1.1 }}
            className="bg-fbNavy p-4 rounded-3xl shadow-2xl shadow-fbNavy/20 rotate-3 transition-all duration-500"
          >
            <LayoutGrid className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black text-fbNavy tracking-tight italic uppercase leading-none">
              Class <span className="text-fbOrange">Vault</span>
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-fbOrange' : 'bg-green-500'}`}></span>
              </span>
              {loading ? 'Syncing Registry...' : 'Registry Secure'}
            </div>
          </div>
        </div>

        <div className="relative group w-full md:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-fbOrange transition-colors" />
          <input 
            type="text" 
            placeholder="Search section code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-[#f8fafc] border border-slate-100 rounded-[28px] text-[12px] font-black text-fbNavy uppercase focus:ring-8 focus:ring-fbNavy/5 focus:border-fbNavy focus:bg-white outline-none transition-all shadow-inner"
          />
        </div>
      </motion.header>

      {/* ERROR STATE */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-2 border-dashed border-red-200 p-8 rounded-[40px] flex items-center gap-6 text-red-600 mb-12"
          >
            <div className="bg-white p-4 rounded-2xl shadow-lg"><AlertCircle /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Neural Link Severed</p>
              <p className="text-sm font-bold opacity-80 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DATA DISPLAY */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
             <div className="absolute inset-0 bg-fbOrange/20 blur-3xl rounded-full" />
             <Loader2 className="text-fbNavy relative z-10" size={64} />
          </motion.div>
          <p className="font-black uppercase italic tracking-[0.5em] text-fbNavy mt-10 animate-pulse text-xs">Querying Distributed Registry...</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 bg-white rounded-[70px] border-4 border-dashed border-slate-100 shadow-inner"
        >
          <div className="p-10 bg-slate-50 rounded-[45px] mb-8 relative">
            <GraduationCap size={72} className="text-slate-100" />
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="absolute top-4 right-4 text-fbOrange w-8 h-8" />
            </motion.div>
          </div>
          <h3 className="font-black text-fbNavy uppercase italic text-3xl tracking-tighter text-center px-4">Registry Empty</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-4 text-center">Establish new section protocols to begin</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 pb-20"
        >
          {filteredSections.map((section) => (
            <SectionCard key={section.id} section={section} router={router} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function SectionCard({ section, router }) {
  const studentCount = section.students?.[0]?.count || 0;

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -15 }}
      className="bg-white rounded-[60px] p-12 border border-slate-50 shadow-xl shadow-fbNavy/5 hover:shadow-fbOrange/10 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full"
    >
      {/* High-Tech Background Aura */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-fbOrange/10 to-transparent rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-20 h-20 bg-fbNavy rounded-[30px] flex items-center justify-center shadow-2xl shadow-fbNavy/30 group-hover:bg-fbOrange transition-all duration-500"
          >
            <GraduationCap className="text-white" size={32} />
          </motion.div>
          
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Live Status</span>
             <div className="bg-green-50 text-green-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 border border-green-100 shadow-sm">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> Active
             </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
             <motion.div 
               initial={{ width: 10 }}
               whileInView={{ width: 32 }}
               className="h-1 bg-fbOrange rounded-full" 
             />
             <p className="text-[12px] font-black text-fbOrange uppercase tracking-[0.3em]">
               {section.course_name || "General Curriculum"}
             </p>
          </div>
          <h3 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter mb-8 leading-none group-hover:text-fbOrange transition-all duration-300">
            {section.section_code}
          </h3>
          
          <div className="space-y-5">
            <InfoTile icon={<Clock size={18} />} label="Unit Schedule" value={section.schedule || "TBA"} />
            <InfoTile icon={<Users size={18} className="text-fbOrange" />} label="Total Roster" value={`${studentCount} Verified Students`} />
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push(`/admin/class-record/${section.section_code}`)}
        className="relative z-10 w-full py-6 bg-fbNavy text-white rounded-[32px] text-[13px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-4 overflow-hidden group/btn shadow-2xl shadow-fbNavy/20"
      >
        <span className="relative z-10">Access Roster</span>
        <ArrowRightCircle size={22} className="relative z-10 group-hover/btn:translate-x-3 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-fbOrange to-orange-600 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500" />
      </motion.button>
    </motion.div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-[28px] border border-slate-100 group-hover:bg-white group-hover:border-fbOrange/10 transition-all duration-300">
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50 group-hover:rotate-12 transition-transform">{icon}</div>
      <div>
        <span className="text-[10px] font-black text-slate-300 uppercase block tracking-widest mb-1">{label}</span>
        <span className="text-[12px] font-black text-fbNavy uppercase italic tracking-tight">{value}</span>
      </div>
    </div>
  );
}
