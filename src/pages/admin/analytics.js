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

  const goToApprovals = () => {
    router.push('/admin/approval'); 
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Loader2 className="text-[#FF6B00]" size={80} />
      </motion.div>
      <p className="mt-6 font-black text-[#001529] uppercase tracking-[0.5em] text-xs">
        Synchronizing Academic Data...
      </p>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1700px] mx-auto p-6 md:p-12 space-y-12 bg-[#f8fafc] min-h-screen font-sans"
      >
        {/* HEADER SECTION - Design Matched to Classes.js */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden bg-[#001529] p-12 md:p-20 rounded-[40px] shadow-2xl shadow-[#001529]/40"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FF6B00]/20 via-transparent to-transparent opacity-50" />
          <Zap className="absolute -right-10 -bottom-10 w-96 h-96 text-white/5 rotate-12" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10">
                <BookOpen className="text-[#FF6B00] w-5 h-5" />
                <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">Instructor Command Center</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter leading-[0.85]">
                TEACHING <span className="text-[#FF6B00]">PULSE</span>
              </h1>
              <p className="text-white/50 font-medium max-w-2xl text-xl leading-relaxed">
                Analyzing the bridge between your pedagogy and student enrollment.
              </p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-[#001529] px-14 py-8 rounded-[30px] font-black text-[14px] uppercase tracking-[0.2em] shadow-2xl hover:bg-[#FF6B00] hover:text-white transition-colors"
            >
              <Download size={22} className="inline mr-3" /> Download Faculty Audit
            </motion.button>
          </div>
        </motion.div>

        {/* STATS GRID - design elements matched */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Student Reach" value={stats.totalStudents} icon={<Users />} color="blue" trend="Total Learners" />
          <StatCard title="Onboarding Rate" value={stats.totalActive} icon={<UserCheck />} color="green" trend="Ready to Teach" />
          <StatCard title="Pending Rosters" value={stats.totalPending} icon={<Clock />} color="orange" trend="Awaiting Access" />
          <StatCard title="Teacher Load" value={stats.sectionData.length} icon={<Target />} color="purple" trend="Active Sections" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* SECTION PERFORMANCE */}
          <motion.div 
            variants={itemVariants}
            className="xl:col-span-8 bg-white p-14 rounded-[50px] shadow-2xl shadow-[#001529]/5 border border-slate-100"
          >
            <h3 className="text-4xl font-black text-[#001529] uppercase italic mb-12 flex items-center gap-5">
              <BarChart3 className="text-[#FF6B00]" size={40} /> Classroom Density
            </h3>
            <div className="grid gap-8">
              {stats.sectionData.map((sec, index) => {
                const count = sec.profiles?.[0]?.count || 0;
                const percentage = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;
                return (
                  <div key={sec.id} className="p-8 rounded-[35px] bg-[#f8fafc] border border-transparent hover:border-[#FF6B00]/20 transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-black text-[#001529] uppercase text-xl tracking-widest">{sec.section_code}</span>
                      <span className="text-3xl font-black text-[#FF6B00] italic">{count}</span>
                    </div>
                    <div className="h-5 bg-white rounded-full p-1 border border-slate-100 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-[#001529] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* SIDEBAR */}
          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-10">
            <div className="bg-gradient-to-br from-[#001529] to-[#002a52] p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
              <Activity className="mb-8 w-16 h-16 p-4 bg-[#FF6B00] rounded-[25px] text-white" />
              <h4 className="text-3xl font-black italic uppercase mb-4 text-[#FF6B00]">Approval Queue</h4>
              <p className="text-white/70 text-lg mb-12 leading-relaxed font-medium">
                Review and authorize <span className="text-white font-black underline underline-offset-8 decoration-[#FF6B00]">{stats.totalPending} pending</span> student applications.
              </p>
              <button 
                onClick={goToApprovals}
                className="w-full bg-[#FF6B00] text-white py-7 rounded-[25px] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white hover:text-[#001529] transition-all"
              >
                Open Approval Desk <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-[#FF6B00]",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -10 }}
      className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-xl shadow-[#001529]/5 relative overflow-hidden group"
    >
      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-10 ${colorMap[color]}`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">{title}</p>
      <div className="flex items-baseline gap-4">
        <h4 className="text-7xl font-black text-[#001529] italic tracking-tighter group-hover:text-[#FF6B00] transition-colors">{value}</h4>
        <span className="text-[10px] font-black text-[#001529]/30 uppercase bg-slate-50 px-3 py-1 rounded-lg">{trend}</span>
      </div>
    </motion.div>
  );
}
