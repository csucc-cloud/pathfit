import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Download,
  ArrowUpRight,
  Activity,
  Users,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgCompliance: '84%',
    totalMinutes: '12,450',
    topSection: 'Section Alpha',
    activeUsers: 0
  });

  useEffect(() => {
    // Logic to calculate real-time analytics from exercise_logs would go here
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto animate-entrance">
      {/* HEADER WITH EXPORT ACTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 bg-white p-8 rounded-[40px] shadow-xl shadow-fbNavy/5 border border-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fbOrange/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-fbOrange/10 transition-colors duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-fbOrange/10 rounded-lg">
              <Sparkles size={16} className="text-fbOrange animate-pulse" />
            </div>
            <span className="text-[11px] font-black text-fbOrange uppercase tracking-[0.4em]">Intelligence Hub</span>
          </div>
          <h1 className="text-5xl font-black text-fbNavy uppercase italic tracking-tighter leading-none">
            Performance <span className="text-fbOrange">Insights</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            Live tracking of student training metrics
          </p>
        </div>

        <button className="relative z-10 flex items-center gap-3 bg-fbNavy text-white px-10 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-widest hover:bg-fbOrange transition-all shadow-2xl shadow-fbNavy/20 active:scale-95 group">
          <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
          Export Reports
        </button>
      </div>

      {/* TOP LEVEL INSIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
        <InsightCard 
          label="Training Compliance" 
          value={stats.avgCompliance} 
          icon={<Target size={24} />} 
          trend="+5.2%"
          positive={true}
        />
        <InsightCard 
          label="Total Activity Mins" 
          value={stats.totalMinutes} 
          icon={<TrendingUp size={24} />} 
          trend="Last 30 Days"
          positive={true}
        />
        <InsightCard 
          label="Top Performing" 
          value={stats.topSection} 
          icon={<Award size={24} />} 
          trend="By Avg. Grade"
        />
        <InsightCard 
          label="Active Athletes" 
          value="92" 
          icon={<Users size={24} />} 
          trend="Current Session"
          positive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN CHART AREA */}
        <div className="lg:col-span-2 bg-white rounded-[50px] p-10 border border-white shadow-xl shadow-fbNavy/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fbNavy via-fbOrange to-fbNavy opacity-20" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h3 className="font-black text-fbNavy uppercase italic text-2xl tracking-tight">Activity Volume</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Weekly Student Submissions</p>
            </div>
            <div className="flex bg-[#f8fafc] p-1.5 rounded-2xl border border-slate-100">
              <button className="px-6 py-2.5 bg-white shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-fbNavy">Weekly</button>
              <button className="px-6 py-2.5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-fbNavy transition-colors">Monthly</button>
            </div>
          </div>
          
          {/* PLACEHOLDER FOR ACTUAL GRAPH */}
          <div className="h-80 w-full bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-fbOrange/30 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
            <div className="text-center relative z-10">
              <div className="bg-white p-6 rounded-3xl shadow-xl mb-4 inline-block">
                <BarChart3 size={48} className="text-fbOrange animate-bounce" />
              </div>
              <p className="text-[12px] font-black text-fbNavy uppercase tracking-[0.3em]">Graph Data Syncing...</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 w-4 rounded-full bg-fbOrange/20 animate-pulse delay-${i * 150}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: RECENT ACHIEVEMENTS */}
        <div className="flex flex-col gap-8">
          <div className="bg-gradient-to-br from-fbNavy to-[#1a2a4a] rounded-[50px] p-10 text-white shadow-2xl shadow-fbNavy/30 relative overflow-hidden group">
            <Zap size={120} className="absolute -right-8 -bottom-8 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            
            <h3 className="font-black uppercase italic text-xl mb-8 flex items-center gap-4 relative z-10">
              <div className="p-2 bg-fbOrange rounded-xl shadow-lg shadow-fbOrange/20">
                <Calendar size={20} className="text-white" />
              </div>
              Deadlines
            </h3>
            <div className="space-y-4 relative z-10">
              <DeadlineItem title="Midterm Logs" date="April 25" status="Urgent" />
              <DeadlineItem title="Cardio Assessment" date="May 02" status="Upcoming" />
              <DeadlineItem title="Final Submission" date="May 20" status="Scheduled" />
            </div>
          </div>

          <div className="bg-white rounded-[50px] p-10 border border-white shadow-xl shadow-fbNavy/5 hover:shadow-2xl transition-all">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-fbNavy uppercase italic text-xl">Quick Stats</h3>
               <Activity size={20} className="text-fbOrange" />
             </div>
             <div className="space-y-8">
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-fbNavy transition-colors">Verified Logs</span>
                     <span className="text-lg font-black text-fbNavy italic">1,402</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                     <div className="h-full bg-gradient-to-r from-fbNavy to-fbOrange w-[75%] rounded-full shadow-inner" />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-fbNavy transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Users size={18} className="text-fbNavy" />
                    </div>
                    <span className="text-[10px] font-black text-fbNavy uppercase tracking-widest group-hover:text-white transition-colors">Team View</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-fbOrange group-hover:translate-x-1 transition-all" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ label, value, icon, trend, positive }) {
  return (
    <div className="bg-white p-8 rounded-[45px] border border-white shadow-xl shadow-fbNavy/5 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-6 -mt-6 z-0 group-hover:bg-fbOrange/5 transition-colors duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="p-5 bg-slate-50 text-fbNavy rounded-[24px] group-hover:bg-fbNavy group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
            {icon}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${positive ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
            {positive && <ArrowUpRight size={14} className="animate-bounce" />}
            {trend}
          </div>
        </div>
        <h2 className="text-4xl font-black text-fbNavy italic tracking-tighter mb-2 group-hover:text-fbOrange transition-colors">{value}</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      </div>
    </div>
  );
}

function DeadlineItem({ title, date, status }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group cursor-pointer border border-white/5">
      <div>
        <p className="text-sm font-black italic tracking-tight">{title}</p>
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">{date}</p>
      </div>
      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg ${
        status === 'Urgent' 
          ? 'bg-fbOrange text-white shadow-fbOrange/20' 
          : 'bg-white/10 text-white shadow-black/10'
      }`}>
        {status}
      </span>
    </div>
  );
}
