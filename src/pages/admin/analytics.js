import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, Users, 
  Activity, Download, Clock,
  Loader2, Zap, ChevronRight, Target, BookOpen, UserCheck,
  Search, GraduationCap
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="text-[#001529]" size={40} />
      </motion.div>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen font-sans"
      >
        {/* --- HEADER PILL (Patterned after Class Vault) --- */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[40px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#001529] rounded-[20px] flex items-center justify-center shadow-lg shadow-navy-900/20">
              <PieChart className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#001529] italic tracking-tighter uppercase">
                ANALYTICS <span className="text-[#FF6B00]">INSIGHTS</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Enrollment Data</span>
              </div>
            </div>
          </div>

          {/* Search-style button for actions */}
          <div className="relative w-full md:w-[400px]">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
               <Download size={18} />
            </div>
            <button className="w-full bg-slate-50 text-left pl-14 pr-6 py-4 rounded-full text-xs font-bold text-slate-400 border border-slate-100 hover:bg-slate-100 transition-all uppercase tracking-widest">
              Export Faculty Report...
            </button>
          </div>
        </motion.div>

        {/* --- MAIN ANALYTICS CARDS (Grid patterned after your screenshot) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Total Roster" value={stats.totalStudents} icon={<Users />} label="VERIFIED STUDENTS" />
          <StatCard title="Active Status" value={stats.totalActive} icon={<UserCheck />} label="OFFICIALLY ENROLLED" />
          <StatCard title="Approval Queue" value={stats.totalPending} icon={<Clock />} label="AWAITING REVIEW" orange />
          <StatCard title="Active Sections" value={stats.sectionData.length} icon={<GraduationCap />} label="CURRENT CLASSES" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* --- SECTION DENSITY LISTING --- */}
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-8 space-y-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-6 bg-[#FF6B00] rounded-full" />
              <h3 className="text-sm font-black text-[#001529] uppercase tracking-[0.3em]">Classroom Distribution</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.sectionData.map((sec) => (
                <div key={sec.id} className="bg-white rounded-[45px] p-8 shadow-sm border border-slate-50 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-[#001529] rounded-2xl flex items-center justify-center">
                      <GraduationCap className="text-white" size={24} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-[10px] font-black text-[#001529] uppercase">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-8">
                    <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest">Section Code</span>
                    <h4 className="text-4xl font-black text-[#001529] italic leading-none">{sec.section_code}</h4>
                  </div>

                  <div className="bg-slate-50 rounded-[25px] p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#001529] shadow-sm">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Roster</p>
                        <p className="text-sm font-black text-[#001529]">{sec.profiles?.[0]?.count || 0} Students</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-[#FF6B00] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* --- SIDEBAR ACTIONS --- */}
          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-8">
             <div className="bg-white rounded-[45px] p-10 shadow-sm border border-slate-50">
               <div className="w-16 h-16 bg-[#FF6B00] rounded-[22px] flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
                 <Activity className="text-white" size={28} />
               </div>
               <h4 className="text-2xl font-black text-[#001529] italic uppercase tracking-tighter mb-4">Pending Approvals</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                 There are <span className="text-[#001529] font-black underline decoration-[#FF6B00] decoration-2">{stats.totalPending} students</span> waiting for section confirmation.
               </p>
               <button 
                onClick={goToApprovals}
                className="w-full bg-[#001529] text-white py-6 rounded-[25px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/10"
               >
                 Review Registry <ChevronRight size={18} />
               </button>
             </div>

             <div className="bg-white rounded-[45px] p-10 shadow-sm border border-slate-50">
               <h4 className="text-sm font-black text-[#001529] uppercase tracking-[0.2em] mb-8">Program Split</h4>
               <div className="space-y-4">
                 {Object.entries(stats.courseData).map(([name, count]) => (
                   <div key={name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
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

function StatCard({ title, value, icon, label, orange }) {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-50 relative overflow-hidden group transition-all"
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${orange ? 'bg-orange-50 text-[#FF6B00]' : 'bg-slate-50 text-[#001529]'}`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{title}</span>
        <h4 className={`text-6xl font-black italic tracking-tighter leading-none mb-4 ${orange ? 'text-[#FF6B00]' : 'text-[#001529]'}`}>
          {value}
        </h4>
        <div className="bg-slate-50 px-5 py-2 rounded-full border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}
