import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Users, Activity, Download, Clock,
  Loader2, ChevronRight, GraduationCap, UserCheck, 
  FileSpreadsheet, ArrowUpRight
} from 'lucide-react';

// Advanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 } 
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
    } catch (err) { 
      console.error("Analytics Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Functional Export to CSV
  const handleExport = () => {
    const headers = ["Section Code", "Student Count", "Status"];
    const rows = stats.sectionData.map(sec => [
      sec.section_code,
      sec.profiles?.[0]?.count || 0,
      "Active"
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PathFit_Analytics_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToApprovals = () => router.push('/admin/approvals'); 

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Loader2 className="text-[#001529]" size={48} />
      </motion.div>
      <p className="mt-4 font-black text-[#001529]/40 uppercase text-[10px] tracking-[0.3em]">Gathering Intelligence</p>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-6 md:space-y-10 bg-[#f8fafc] min-h-screen font-sans"
      >
        {/* --- DYNAMIC HEADER PILL --- */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-white"
        >
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 md:w-16 md:h-16 bg-[#001529] rounded-[18px] md:rounded-[20px] flex items-center justify-center shadow-xl shadow-navy-900/20"
            >
              <PieChart className="text-white" size={28} />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#001529] italic tracking-tighter uppercase leading-none">
                ANALYTICS <span className="text-[#FF6B00]">INSIGHTS</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Operational</span>
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="group relative w-full md:w-[350px] bg-slate-50 hover:bg-[#001529] border border-slate-100 p-4 md:p-5 rounded-full flex items-center justify-between transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={18} className="text-[#FF6B00] group-hover:text-white transition-colors" />
              <span className="text-[11px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Export Faculty Report</span>
            </div>
            <ArrowUpRight size={18} className="text-slate-300 group-hover:text-white" />
          </motion.button>
        </motion.div>

        {/* --- METRIC GRID: Optimized for Portrait/Mobile --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard title="Roster" value={stats.totalStudents} icon={<Users />} label="VERIFIED" />
          <StatCard title="Active" value={stats.totalActive} icon={<UserCheck />} label="ENROLLED" />
          <StatCard title="Pending" value={stats.totalPending} icon={<Clock />} label="QUEUED" orange />
          <StatCard title="Classes" value={stats.sectionData.length} icon={<GraduationCap />} label="SECTIONS" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-10">
          {/* --- CLASSROOM DISTRIBUTION --- */}
          <motion.div variants={itemVariants} className="xl:col-span-8 space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="w-2 h-6 bg-[#FF6B00] rounded-full" />
              <h3 className="text-[11px] font-black text-[#001529] uppercase tracking-[0.4em]">Classroom Distribution</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <AnimatePresence>
                {stats.sectionData.map((sec) => (
                  <motion.div 
                    key={sec.id}
                    layout
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-[35px] md:rounded-[45px] p-6 md:p-8 shadow-sm border border-white group transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200"
                  >
                    <div className="flex justify-between items-start mb-6 md:mb-8">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-[#001529] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#FF6B00] transition-colors duration-500">
                        <GraduationCap className="text-white" size={24} />
                      </div>
                      <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-[9px] font-black text-green-600 uppercase">Live</span>
                      </div>
                    </div>

                    <div className="mb-6 md:mb-8">
                      <span className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-widest">Section Handle</span>
                      <h4 className="text-3xl md:text-4xl font-black text-[#001529] italic leading-none mt-1 uppercase">{sec.section_code}</h4>
                    </div>

                    <div className="bg-slate-50 rounded-[22px] md:rounded-[25px] p-4 md:p-5 flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-[#001529] shadow-sm">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#001529]">{sec.profiles?.[0]?.count || 0} Students</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Current Occupancy</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* --- SIDEBAR CONTENT --- */}
          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-6 md:space-y-8">
             <motion.div 
               whileHover={{ scale: 1.01 }}
               className="bg-[#001529] rounded-[35px] md:rounded-[45px] p-8 md:p-10 shadow-2xl shadow-navy-900/40 relative overflow-hidden"
             >
               <div className="absolute -right-4 -top-4 opacity-10">
                 <Activity size={150} className="text-white" />
               </div>
               <div className="relative z-10">
                 <div className="w-14 h-14 bg-[#FF6B00] rounded-[18px] flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                   <Activity className="text-white" size={24} />
                 </div>
                 <h4 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter mb-3">Pending Registry</h4>
                 <p className="text-white/50 text-xs md:text-sm font-medium leading-relaxed mb-8">
                   System has flagged <span className="text-white font-black">{stats.totalPending} accounts</span> for verification. Review is required for database consistency.
                 </p>
                 <motion.button 
                  onClick={goToApprovals}
                  whileHover={{ gap: "1.2rem" }}
                  className="w-full bg-white text-[#001529] py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
                 >
                   Open Clearance <ChevronRight size={16} />
                 </motion.button>
               </div>
             </motion.div>

             <div className="bg-white rounded-[35px] md:rounded-[45px] p-8 md:p-10 shadow-sm border border-white">
               <h4 className="text-[11px] font-black text-[#001529] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full" /> Program Split
               </h4>
               <div className="space-y-3">
                 {Object.entries(stats.courseData).map(([name, count]) => (
                   <motion.div 
                    key={name} 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-50 hover:border-slate-200 transition-colors"
                   >
                     <span className="text-[10px] font-black text-[#001529] uppercase tracking-wider">{name}</span>
                     <div className="flex items-center gap-2">
                        <span className="text-lg font-black italic text-[#FF6B00]">{count}</span>
                        <span className="text-[8px] font-bold text-slate-300 uppercase">Units</span>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, label, orange }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[45px] shadow-sm border border-white relative overflow-hidden group transition-all"
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner ${orange ? 'bg-orange-50 text-[#FF6B00]' : 'bg-slate-50 text-[#001529]'}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</span>
        <h4 className={`text-3xl md:text-6xl font-black italic tracking-tighter leading-none mb-3 md:mb-4 ${orange ? 'text-[#FF6B00]' : 'text-[#001529]'}`}>
          {value}
        </h4>
        <div className="bg-slate-50 px-3 md:px-5 py-1.5 md:py-2 rounded-full border border-slate-100">
          <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}
