import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Users, Activity, Download, Clock,
  Loader2, ChevronRight, GraduationCap, UserCheck, 
  FileSpreadsheet, ArrowUpRight, Sparkles, TrendingUp, Terminal
} from 'lucide-react';

// Advanced Animation Suite
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, filter: "blur(10px)" },
  visible: { 
    y: 0, 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  }
};

const cardHover = {
  hover: { 
    y: -10, 
    transition: { type: "spring", stiffness: 400, damping: 10 } 
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
    link.setAttribute("download", `PathFit_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToApprovals = () => router.push('/admin/approvals'); 

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd]">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-t-4 border-b-4 border-[#001529]/10"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="text-[#FF6B00]" size={32} />
        </motion.div>
      </div>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10 space-y-8 min-h-screen font-sans overflow-x-hidden"
      >
        {/* --- PREMIUM HEADER PILL --- */}
        <motion.div 
          variants={itemVariants}
          className="relative bg-white/70 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-center gap-8 border border-white/80 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF6B00]/5 to-transparent rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <div className="flex items-center gap-5 md:gap-6 w-full md:w-auto relative z-10">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 md:w-20 md:h-20 bg-[#001529] rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-2xl shadow-navy-900/40 relative shrink-0"
            >
              <PieChart className="text-white" size={28} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] rounded-full border-2 border-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-[#FF6B00]" />
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Analytics</span>
              </div>
              <h1 className="text-2xl md:text-5xl font-black text-[#001529] italic tracking-tighter uppercase leading-none">
                DATA <span className="text-[#FF6B00]">ANALYTICS</span>
              </h1>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,21,41,0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="group relative w-full md:w-[300px] bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center justify-between transition-all duration-300 overflow-hidden shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#001529]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#001529] group-hover:text-white transition-colors duration-300">
                <FileSpreadsheet size={18} />
              </div>
              <span className="text-[10px] font-black text-[#001529] uppercase tracking-widest">Export Dataset</span>
            </div>
            <Download size={18} className="text-slate-300 group-hover:text-[#FF6B00] group-hover:translate-y-0.5 transition-all" />
          </motion.button>
        </motion.div>

        {/* --- STAT CARDS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard title="Total Students" value={stats.totalStudents} icon={<Users />} label="STUDENTS" />
          <StatCard title="Active Status" value={stats.totalActive} icon={<UserCheck />} label="VERIFIED" />
          <StatCard title="Approval Queue" value={stats.totalPending} icon={<Clock />} label="PENDING" orange />
          <StatCard title="Active Sections" value={stats.sectionData.length} icon={<GraduationCap />} label="CLASSES" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-10">
          {/* --- MAIN CONTENT AREA --- */}
          <motion.div variants={itemVariants} className="xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-7 bg-[#001529] rounded-full" />
                <h3 className="text-xs md:text-sm font-black text-[#001529] uppercase tracking-[0.4em]">Section Distribution</h3>
              </div>
              <div className="h-[1px] flex-1 mx-8 bg-slate-200/50 hidden md:block" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stats.sectionData.length} Sections Active</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {stats.sectionData.map((sec) => (
                  <motion.div 
                    key={sec.id}
                    layout
                    variants={cardHover}
                    whileHover="hover"
                    className="group bg-white rounded-[32px] md:rounded-[40px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-white hover:border-slate-100 relative transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                        <GraduationCap size={120} />
                    </div>
                    
                    <div className="flex justify-between items-center mb-10">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-white transition-all duration-500">
                        <GraduationCap size={22} />
                      </div>
                      <div className="flex -space-x-3">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                              {i}
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-1 mb-10">
                      <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">Registration Code</p>
                      <h4 className="text-4xl md:text-5xl font-black text-[#001529] italic leading-none tracking-tighter uppercase">{sec.section_code}</h4>
                    </div>

                    <div className="flex items-center justify-between p-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Population</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl md:text-2xl font-black text-[#001529]">{sec.profiles?.[0]?.count || 0}</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Students</span>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#001529] text-white flex items-center justify-center shadow-lg shadow-navy-900/20"
                      >
                        <ArrowUpRight size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* --- SIDEBAR CONTENT AREA --- */}
          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-8">
             {/* Approval Box */}
             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-[#001529] rounded-[32px] md:rounded-[45px] p-8 md:p-10 shadow-2xl shadow-navy-900/40 relative overflow-hidden group border border-white/5"
             >
               <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10">
                 <div className="w-14 h-14 md:w-16 md:h-16 bg-[#FF6B00] rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-500/30">
                   <Activity className="text-white" size={26} />
                 </div>
                 <h4 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Verification Center</h4>
                 <p className="text-white/40 text-[13px] md:text-sm font-medium leading-relaxed mb-10">
                   Database has identified <span className="text-white font-black underline decoration-[#FF6B00] decoration-2 underline-offset-4">{stats.totalPending} enrollments</span> waiting for instructor clearance.
                 </p>
                 <motion.button 
                  onClick={goToApprovals}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="w-full bg-white text-[#001529] py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-[11px] md:text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
                 >
                   Process Approvals <ChevronRight size={16} />
                 </motion.button>
               </div>
             </motion.div>

             {/* Program Split Box */}
             <div className="bg-white rounded-[32px] md:rounded-[45px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white">
               <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] md:text-[11px] font-black text-[#001529] uppercase tracking-[0.3em]">Program Breakdown</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               </div>
               <div className="space-y-4">
                 {Object.entries(stats.courseData).map(([name, count]) => (
                   <motion.div 
                    key={name} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="group flex items-center justify-between p-5 md:p-6 bg-slate-50/50 rounded-2xl md:rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all duration-300"
                   >
                     <div className="flex flex-col min-w-0 pr-4">
                        <span className="text-[9px] md:text-[10px] font-black text-[#001529] uppercase tracking-wider mb-2 truncate">{name}</span>
                        <div className="w-16 md:w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-[#FF6B00]" 
                            />
                        </div>
                     </div>
                     <div className="flex flex-col items-end shrink-0">
                        <span className="text-xl md:text-2xl font-black italic text-[#001529] leading-none">{count}</span>
                        <span className="text-[8px] font-bold text-slate-300 uppercase">Registered</span>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </div>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, label, orange }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.03)" }}
      className="bg-white p-7 md:p-10 rounded-[32px] md:rounded-[50px] shadow-[0_10px_30px_rgba(0,0,0,0.01)] border border-white relative overflow-hidden group transition-all"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[22px] md:rounded-[30px] flex items-center justify-center mb-6 transition-all duration-500 ${orange ? 'bg-orange-50 text-[#FF6B00] group-hover:bg-[#FF6B00] group-hover:text-white' : 'bg-slate-50 text-[#001529] group-hover:bg-[#001529] group-hover:text-white'}`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{title}</span>
        <h4 className={`text-4xl md:text-6xl font-black italic tracking-tighter leading-none mb-5 ${orange ? 'text-[#FF6B00]' : 'text-[#001529]'}`}>
          {value}
        </h4>
        <div className="bg-slate-50/50 backdrop-blur-sm px-5 py-2 rounded-xl border border-slate-100">
          <span className="text-[8px] md:text-[9px] font-black text-[#001529]/40 uppercase tracking-[0.2em]">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}
