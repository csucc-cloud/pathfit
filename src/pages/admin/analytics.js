import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, Users, 
  Activity, Download, ShieldCheck, Clock,
  ArrowUpRight, ArrowDownRight, Loader2, 
  Zap, ChevronRight, Target, Sparkles
} from 'lucide-react';

export default function AnalyticsPage() {
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

      const sectionCodes = sections.map(s => s.section_code);
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
        sectionData: sections,
        courseData: courses,
        totalStudents: students.length
      });
    } catch (err) { console.error("Analytics Error:", err); } 
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="relative">
        <Loader2 className="animate-spin text-fbOrange" size={64} />
        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fbNavy w-6 h-6" />
      </div>
      <p className="mt-4 font-black text-fbNavy uppercase tracking-[0.3em] text-[10px]">Processing Intelligence...</p>
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <div className="max-w-[1700px] mx-auto p-4 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen font-sans">
        
        {/* --- DYNAMIC GLASS HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-fbNavy p-10 md:p-16 rounded-[50px] shadow-2xl shadow-fbNavy/20"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-fbOrange/20 to-transparent z-0" />
          <Zap className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <Sparkles className="text-fbOrange w-4 h-4" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Live Intelligence Feed</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
                FACULTY <span className="text-fbOrange">INSIGHTS</span>
              </h1>
              <p className="text-white/50 font-medium max-w-xl text-lg">
                Real-time visualization of student distribution and enrollment health across your assigned sections.
              </p>
            </div>
            
            <button className="group relative bg-white text-fbNavy px-10 py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-fbOrange hover:text-white transition-all overflow-hidden shadow-xl active:scale-95">
              <span className="relative z-10 flex items-center gap-3">
                <Download size={20} className="group-hover:-translate-y-1 transition-transform" /> Export Analytics
              </span>
            </button>
          </div>
        </motion.div>

        {/* --- CORE STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Active Network" value={stats.totalStudents} icon={<Users />} color="blue" trend="+5.2%" />
          <StatCard title="Compliance Rate" value={stats.totalActive} icon={<ShieldCheck />} color="green" trend="Verified" />
          <StatCard title="Pipeline Queue" value={stats.totalPending} icon={<Clock />} color="orange" trend="Action Required" />
          <StatCard title="Unit Density" value={Math.round(stats.totalActive / (stats.sectionData.length || 1))} icon={<Target />} color="purple" trend="Avg/Class" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* --- SECTION PERFORMANCE (LEFT) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-8 bg-white p-10 rounded-[60px] shadow-xl shadow-fbNavy/5 border border-white relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-fbNavy uppercase italic tracking-tighter flex items-center gap-3">
                  <BarChart3 className="text-fbOrange" size={28} /> Section Distribution
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Live Population Census</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-100" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
            </div>

            <div className="grid gap-8">
              {stats.sectionData.map((sec, index) => {
                const count = sec.profiles?.[0]?.count || 0;
                const percentage = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;
                return (
                  <motion.div 
                    key={sec.id}
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: index * 0.1 }}
                    className="relative group p-6 rounded-[32px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-fbNavy text-white flex items-center justify-center font-black italic text-xs">
                          {sec.section_code.substring(0, 2)}
                        </div>
                        <span className="font-black text-fbNavy uppercase text-sm tracking-widest">{sec.section_code}</span>
                      </div>
                      <span className="text-[12px] font-black text-fbNavy bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        {count} <span className="text-slate-400 font-bold ml-1">STUDENTS</span>
                      </span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-2xl overflow-hidden p-1">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-fbNavy to-blue-600 rounded-xl relative group-hover:from-fbOrange group-hover:to-orange-500 transition-all shadow-lg"
                      >
                        <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 -mr-4" />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* --- COURSE METRICS & PRIORITY (RIGHT) --- */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-4 space-y-8"
          >
            {/* Course Split */}
            <div className="bg-white p-10 rounded-[60px] shadow-xl shadow-fbNavy/5 border border-white">
              <h3 className="text-xl font-black text-fbNavy uppercase italic mb-8 flex items-center gap-3">
                <PieChart className="text-fbOrange" size={24} /> Academic Split
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.courseData).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between p-5 bg-[#f8fafc] rounded-[28px] border border-transparent hover:border-fbOrange/20 transition-all group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <TrendingUp size={16} className="text-fbOrange" />
                      </div>
                      <span className="text-[11px] font-black text-fbNavy uppercase tracking-widest leading-none">{name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-fbNavy italic text-xl leading-none">{count}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Enrollments</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Insights Card (Necessary Utility) */}
            <div className="bg-gradient-to-br from-fbOrange to-orange-600 p-10 rounded-[60px] text-white shadow-2xl shadow-fbOrange/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all" />
              <Activity className="mb-6 w-10 h-10 p-2 bg-white/20 rounded-xl" />
              <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Attention Required</h4>
              <p className="text-white/80 text-sm font-medium mb-8">
                You have <span className="font-black text-white">{stats.totalPending} students</span> waiting for section approval. Approve them to include them in active analytics.
              </p>
              <button className="w-full bg-fbNavy text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:gap-5 transition-all">
                Review Queue <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-50 border-blue-100",
    green: "text-emerald-500 bg-emerald-50 border-emerald-100",
    orange: "text-fbOrange bg-orange-50 border-orange-100",
    purple: "text-purple-500 bg-purple-50 border-purple-100"
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl shadow-fbNavy/5 relative overflow-hidden group transition-all"
    >
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${colorMap[color]}`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{title}</p>
          <div className="flex items-baseline gap-3">
            <h4 className="text-5xl font-black text-fbNavy italic tracking-tighter group-hover:text-fbOrange transition-colors">
              {value}
            </h4>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {React.cloneElement(icon, { size: 120 })}
      </div>
    </motion.div>
  );
}
