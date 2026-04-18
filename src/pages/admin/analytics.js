import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, Users, 
  Activity, Download, Clock,
  Loader2, Zap, ChevronRight, Target, BookOpen, UserCheck
} from 'lucide-react';

// Variants for intense staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
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
    } catch (err) { console.error("Analytics Error:", err); } 
    finally { setLoading(false); }
  };

  // UPDATED: Navigation Handler points to admin/approval
  const goToApprovals = () => {
    router.push('/admin/approval'); 
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative"
      >
        <Loader2 className="text-[#FF6B00]" size={80} />
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="mt-6 font-black text-[#001529] uppercase tracking-[0.5em] text-xs"
      >
        Synchronizing Academic Data...
      </motion.p>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1700px] mx-auto p-4 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen font-sans"
      >
        
        {/* --- DYNAMIC GLASS HEADER --- */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden bg-[#001529] p-10 md:p-16 rounded-[60px] shadow-2xl shadow-[#001529]/30"
        >
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#FF6B00]/30 to-transparent z-0" 
          />
          <Zap className="absolute -right-10 -bottom-10 w-80 h-80 text-white/5 rotate-12" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20">
                <BookOpen className="text-[#FF6B00] w-4 h-4" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Instructor Command Center</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none">
                TEACHING <span className="text-[#FF6B00]">PULSE</span>
              </h1>
              <p className="text-white/60 font-medium max-w-xl text-lg leading-relaxed">
                Analyzing the bridge between your pedagogy and student enrollment. Track your class density and approval velocity in real-time.
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-white text-[#001529] px-12 py-8 rounded-[35px] font-black text-[13px] uppercase tracking-[0.2em] transition-all overflow-hidden shadow-2xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Download size={20} /> Download Faculty Audit
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* --- CORE STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Student Reach" value={stats.totalStudents} icon={<Users />} color="blue" trend="Total Learners" />
          <StatCard title="Onboarding Rate" value={stats.totalActive} icon={<UserCheck />} color="green" trend="Ready to Teach" />
          <StatCard title="Pending Rosters" value={stats.totalPending} icon={<Clock />} color="orange" trend="Awaiting Access" />
          <StatCard title="Teacher Load" value={stats.sectionData.length} icon={<Target />} color="purple" trend="Active Sections" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* --- SECTION PERFORMANCE --- */}
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-8 bg-white p-12 rounded-[70px] shadow-2xl shadow-[#001529]/5 border border-white relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-16">
              <div>
                <h3 className="text-3xl font-black text-[#001529] uppercase italic tracking-tighter flex items-center gap-4">
                  <BarChart3 className="text-[#FF6B00]" size={32} /> Classroom Density
                </h3>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2">Section Population Analysis</p>
              </div>
            </div>

            <div className="grid gap-10">
              {stats.sectionData.map((sec, index) => {
                const count = sec.profiles?.[0]?.count || 0;
                const percentage = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;
                return (
                  <motion.div 
                    key={sec.id}
                    whileHover={{ x: 15 }}
                    className="relative group p-8 rounded-[40px] bg-slate-50/50 hover:bg-white transition-all border border-transparent hover:border-slate-100 hover:shadow-xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[22px] bg-[#001529] text-white flex items-center justify-center font-black italic text-sm group-hover:bg-[#FF6B00] transition-colors">
                          {sec.section_code.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-black text-[#001529] uppercase text-lg tracking-widest">{sec.section_code}</span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Assigned Section Code</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#001529] italic">{count}</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollments</p>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 2, ease: "circOut", delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#001529] to-blue-500 rounded-full relative group-hover:from-[#FF6B00] group-hover:to-orange-500 transition-all"
                      >
                        <motion.div 
                          animate={{ x: ["0%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 w-20 bg-white/20 skew-x-[-20deg]" 
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* --- COURSE METRICS & PRIORITY --- */}
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-4 space-y-10"
          >
            <div className="bg-white p-12 rounded-[70px] shadow-2xl shadow-[#001529]/5 border border-white">
              <h3 className="text-2xl font-black text-[#001529] uppercase italic mb-10 flex items-center gap-4">
                <PieChart className="text-[#FF6B00]" size={28} /> Program Split
              </h3>
              <div className="space-y-5">
                {Object.entries(stats.courseData).map(([name, count]) => (
                  <motion.div 
                    key={name} 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-[35px] border border-transparent hover:border-[#FF6B00]/30 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                        <TrendingUp size={20} className="text-[#FF6B00]" />
                      </div>
                      <span className="text-xs font-black text-[#001529] uppercase tracking-widest">{name}</span>
                    </div>
                    <span className="font-black text-[#001529] italic text-2xl">{count}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ACTION CARD: CONNECTED TO ADMIN/APPROVAL */}
            <motion.div 
              whileHover={{ rotate: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-[#FF6B00] to-orange-600 p-12 rounded-[70px] text-white shadow-2xl shadow-[#FF6B00]/40 relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <Activity className="mb-8 w-14 h-14 p-3 bg-white/20 rounded-2xl" />
              <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Urgent Review</h4>
              <p className="text-white/90 text-sm font-medium mb-10 leading-relaxed">
                There are <span className="underline decoration-white/50 underline-offset-4 font-black text-white">{stats.totalPending} learners</span> currently locked out of their sections. Review the queue to finalize your teaching rosters.
              </p>
              <button 
                onClick={goToApprovals}
                className="w-full bg-[#001529] text-white py-6 rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all group-hover:gap-6"
              >
                Open Approval Desk <ChevronRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-50 border-blue-100",
    green: "text-emerald-500 bg-emerald-50 border-emerald-100",
    orange: "text-[#FF6B00] bg-orange-50 border-orange-100",
    purple: "text-purple-500 bg-purple-50 border-purple-100"
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -15, scale: 1.02 }}
      className="bg-white p-10 rounded-[55px] border border-slate-100 shadow-2xl shadow-[#001529]/5 relative overflow-hidden group transition-all"
    >
      <div className="relative z-10">
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
          className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-inner border ${colorMap[color]}`}
        >
          {React.cloneElement(icon, { size: 32 })}
        </motion.div>
        <div className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{title}</p>
          <div className="flex items-baseline gap-4">
            <h4 className="text-6xl font-black text-[#001529] italic tracking-tighter group-hover:text-[#FF6B00] transition-colors">
              {value}
            </h4>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{trend}</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500">
        {React.cloneElement(icon, { size: 180 })}
      </div>
    </motion.div>
  );
}
