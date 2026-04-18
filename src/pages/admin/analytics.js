import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, Users, 
  Activity, Download, Clock,
  Loader2, Zap, ChevronRight, Target, BookOpen, UserCheck,
  ArrowUpRight, Globe, Fingerprint
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 } 
  }
};

export default function AnalyticsPage() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalPending: 0,
    sectionData: [],
    courseData: {},
    totalStudents: 0
  });

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sections } = await supabase
        .from('sections')
        .select('*, profiles(count)')
        .eq('instructor_id', user.id);

      const sectionCodes = (sections || []).map(s => s.section_code);
      if (sectionCodes.length > 0) {
        const { data: students } = await supabase
          .from('profiles')
          .select('*')
          .in('section_code', sectionCodes)
          .eq('Role', 'student');

        const active = students.filter(s => s.status === 'active').length;
        const pending = students.filter(s => s.status !== 'active').length;
        
        const courses = students.reduce((acc, curr) => {
          const c = curr.course || 'Unassigned';
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalActive: active,
          totalPending: pending,
          sectionData: sections || [],
          courseData: courses,
          totalStudents: students.length
        });
      }
    } catch (err) { console.error("Analytics Error:", err); } 
    finally { setLoading(false); }
  };

  const goToApprovals = () => {
    router.push('/admin/approval'); 
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#001529]">
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <Zap className="text-[#FF6B00] fill-[#FF6B00]" size={60} />
        <div className="absolute inset-0 blur-2xl bg-[#FF6B00] opacity-20" />
      </motion.div>
      <motion.p 
        initial={{ letterSpacing: "0.2em" }}
        animate={{ letterSpacing: "0.6em" }}
        className="mt-10 font-black text-white/40 uppercase text-[10px]"
      >
        Decrypting Ledger...
      </motion.p>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8 bg-[#fdfdfd] min-h-screen font-sans"
      >
        {/* --- ELITE COMMAND HEADER --- */}
        <motion.div 
          variants={itemVariants}
          className="relative group overflow-hidden bg-[#001529] rounded-[48px] p-8 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,21,41,0.5)]"
        >
          {/* Animated Tech Background */}
          <div className="absolute inset-0 opacity-10">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
             <motion.div 
                animate={{ x: [-100, 100], opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-1 h-full bg-gradient-to-b from-transparent via-[#FF6B00] to-transparent absolute left-1/4"
             />
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="h-[2px] w-12 bg-[#FF6B00]" />
                <span className="text-[#FF6B00] font-black text-xs uppercase tracking-[0.5em]">System.Administrator.Portal</span>
              </div>
              
              <h1 className="text-6xl md:text-[120px] font-black text-white leading-none tracking-[-0.06em]">
                DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-orange-400">ARCHITECT</span>
              </h1>
              
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3 text-white/40">
                  <Globe size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">Node: Central_PH</span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <Fingerprint size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">UID: {stats.totalStudents} ACTIVE_THREADS</span>
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "#FF6B00" }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-6 bg-white text-[#001529] pl-10 pr-4 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all"
            >
              Export Intelligence Report
              <div className="bg-[#001529] group-hover:bg-white group-hover:text-[#001529] text-white p-4 rounded-full transition-colors">
                 <Download size={20} />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* --- GRID METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Global Reach" value={stats.totalStudents} icon={<Users />} color="#3B82F6" detail="Total Matrix Population" />
          <StatCard title="Sync Rate" value={stats.totalActive} icon={<UserCheck />} color="#10B981" detail="Verified Identitites" />
          <StatCard title="Locked Nodes" value={stats.totalPending} icon={<Clock />} color="#FF6B00" detail="Awaiting Authorization" />
          <StatCard title="Operation Load" value={stats.sectionData.length} icon={<Target />} color="#8B5CF6" detail="Concurrent Sectors" />
        </div>

        {/* --- ANALYTIC BLOCKS --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-8 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="flex justify-between items-end mb-16">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-[#001529] tracking-tighter uppercase flex items-center gap-4">
                  <div className="w-2 h-8 bg-[#FF6B00] rounded-full" /> SECTOR DENSITY
                </h3>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase ml-6 italic">Population distribution per section node</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <Activity size={14} className="text-[#FF6B00]" />
                <span className="text-[10px] font-black text-[#001529] uppercase">Real-time Stream</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.sectionData.map((sec, index) => {
                const count = sec.profiles?.[0]?.count || 0;
                const percentage = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;
                return (
                  <motion.div 
                    key={sec.id}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[32px] bg-[#f8fafc] border border-slate-100 group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200"
                  >
                    <div className="flex justify-between items-start mb-10">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section_ID</span>
                          <p className="text-xl font-black text-[#001529] italic uppercase leading-none">{sec.section_code}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-3xl font-black text-[#001529] italic leading-none">{count}</p>
                          <span className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-tighter">Units Captured</span>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Payload Capacity</span>
                          <span>{percentage.toFixed(0)}%</span>
                       </div>
                       <div className="h-[6px] bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full bg-gradient-to-r from-[#001529] to-[#FF6B00] rounded-full"
                          />
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* --- SIDECAR COMMANDS --- */}
          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-8">
            <div className="bg-[#001529] rounded-[40px] p-10 text-white relative overflow-hidden group border-b-8 border-[#FF6B00]">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                 <Zap size={120} />
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-4xl font-black italic tracking-tighter leading-none">SECURITY<br/><span className="text-[#FF6B00]">CLEARANCE</span></h4>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">
                    Detected <span className="text-white font-bold">{stats.totalPending} unauthorized learners</span> attempting to bridge into secure sections. Immediate override required.
                  </p>
                </div>

                <motion.button 
                  onClick={goToApprovals}
                  whileHover={{ gap: "2rem" }}
                  className="w-full bg-[#FF6B00] text-white py-6 rounded-full font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all"
                >
                  ACCESS CLEARANCE DESK <ArrowUpRight size={20} />
                </motion.button>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
               <h4 className="text-lg font-black text-[#001529] uppercase tracking-widest mb-8 flex items-center gap-3">
                  <PieChart size={20} className="text-[#FF6B00]" /> Program Split
               </h4>
               <div className="space-y-4">
                  {Object.entries(stats.courseData).map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-[10px] font-black text-[#001529] uppercase tracking-wider">{name}</span>
                       <span className="text-lg font-black italic text-[#FF6B00]">{count}</span>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, color, detail }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm relative overflow-hidden group"
    >
      <div className="flex justify-between items-start relative z-10 mb-8">
        <div className="p-4 rounded-2xl bg-slate-50 text-[#001529] group-hover:bg-[#001529] group-hover:text-white transition-all duration-500">
           {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</span>
           <div className="w-8 h-[2px] bg-[#FF6B00] group-hover:w-16 transition-all duration-700" />
        </div>
      </div>
      
      <div className="relative z-10">
        <h4 className="text-6xl font-black text-[#001529] tracking-tighter italic leading-none mb-3">
          {value}
        </h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-wider group-hover:text-[#FF6B00] transition-colors">{detail}</p>
      </div>

      <div className="absolute -right-6 -bottom-6 text-[#001529] opacity-[0.02] scale-150 rotate-12 pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
         {React.cloneElement(icon, { size: 140 })}
      </div>
    </motion.div>
  );
}
