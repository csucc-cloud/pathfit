import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { 
  BarChart3, PieChart, TrendingUp, Users, 
  GraduationCap, Activity, Download, Filter,
  ArrowUpRight, ArrowDownRight, Loader2, Award,
  ShieldCheck, Clock
} from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalPending: 0,
    sectionData: [],
    courseData: {},
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch Sections to map against students
      const { data: sections } = await supabase
        .from('sections')
        .select('*, profiles(count)')
        .eq('instructor_id', user.id);

      // 2. Fetch All Students under this instructor's sections
      const sectionCodes = sections.map(s => s.section_code);
      const { data: students } = await supabase
        .from('profiles')
        .select('*')
        .in('section_code', sectionCodes)
        .eq('Role', 'student');

      // 3. Process Data
      const active = students.filter(s => s.status === 'active').length;
      const pending = students.filter(s => s.status !== 'active').length;
      
      // Group by Course
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

    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-fbOrange" size={48} />
    </div>
  );

  return (
    <RoleGuard allowedRole="instructor">
      <div className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 bg-[#f8fafc] min-h-screen">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-fbOrange w-5 h-5" />
              <span className="text-[11px] font-black text-fbOrange uppercase tracking-[0.4em]">Data Intelligence</span>
            </div>
            <h1 className="text-5xl font-black text-fbNavy uppercase italic tracking-tighter">
              Performance <span className="text-fbOrange">Analytics</span>
            </h1>
          </div>
          <button className="flex items-center gap-3 bg-fbNavy text-white px-8 py-4 rounded-[22px] font-black text-[11px] uppercase tracking-widest hover:bg-fbOrange transition-all shadow-xl shadow-fbNavy/10">
            <Download size={18} /> Generate Report
          </button>
        </div>

        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            title="Total Registered" 
            value={stats.totalStudents} 
            icon={<Users className="text-blue-500" />} 
            trend="+12%" 
            isUp={true} 
          />
          <StatCard 
            title="Approved Status" 
            value={stats.totalActive} 
            icon={<ShieldCheck className="text-green-500" />} 
            trend="Active" 
            isUp={true} 
            color="bg-green-50"
          />
          <StatCard 
            title="Pending Review" 
            value={stats.totalPending} 
            icon={<Clock className="text-fbOrange" />} 
            trend="Urgent" 
            isUp={false} 
            color="bg-orange-50"
          />
          <StatCard 
            title="Avg. Class Size" 
            value={Math.round(stats.totalActive / (stats.sectionData.length || 1))} 
            icon={<TrendingUp className="text-purple-500" />} 
            trend="Normal" 
            isUp={true} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SECTION DISTRIBUTION */}
          <div className="lg:col-span-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-fbNavy uppercase italic mb-8 flex items-center gap-4">
              <BarChart3 className="text-fbOrange" /> Section Population
            </h3>
            <div className="space-y-6">
              {stats.sectionData.map((sec) => {
                const percentage = (sec.profiles[0].count / stats.totalStudents) * 100;
                return (
                  <div key={sec.id} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-black text-fbNavy uppercase text-xs tracking-widest">{sec.section_code}</span>
                      <span className="text-[10px] font-bold text-slate-400">{sec.profiles[0].count} Students</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="h-full bg-fbNavy group-hover:bg-fbOrange transition-all duration-1000 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COURSE SPLIT */}
          <div className="lg:col-span-4 bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-fbNavy uppercase italic mb-8 flex items-center gap-4">
              <PieChart className="text-fbOrange" /> Course Split
            </h3>
            <div className="space-y-6">
              {Object.entries(stats.courseData).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-fbOrange" />
                    <span className="text-[11px] font-black text-fbNavy uppercase tracking-wider">{name}</span>
                  </div>
                  <span className="font-black text-fbNavy italic">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

function StatCard({ title, value, icon, trend, isUp, color = "bg-white" }) {
  return (
    <div className={`${color} p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full ${isUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {trend}
        </div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-5xl font-black text-fbNavy italic tracking-tighter">{value}</h4>
    </div>
  );
}
