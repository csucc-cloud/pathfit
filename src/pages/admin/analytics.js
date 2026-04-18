import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Download,
  ArrowUpRight,
  Activity,
  Users
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
    <InstructorLayout>
      {/* HEADER WITH EXPORT ACTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter">
            Performance <span className="text-fbOrange">Insights</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Activity size={14} className="text-fbOrange" /> 
            Live tracking of student training metrics
          </p>
        </div>

        <button className="flex items-center gap-3 bg-white border border-gray-100 text-fbNavy px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-fbGray transition-all shadow-sm active:scale-95">
          <Download size={16} />
          Export Reports
        </button>
      </div>

      {/* TOP LEVEL INSIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <InsightCard 
          label="Training Compliance" 
          value={stats.avgCompliance} 
          icon={<Target className="text-fbOrange" />} 
          trend="+5.2%"
          positive={true}
        />
        <InsightCard 
          label="Total Activity Mins" 
          value={stats.totalMinutes} 
          icon={<TrendingUp className="text-blue-500" />} 
          trend="Last 30 Days"
        />
        <InsightCard 
          label="Top Performing" 
          value={stats.topSection} 
          icon={<Award className="text-yellow-500" />} 
          trend="By Avg. Grade"
        />
        <InsightCard 
          label="Active Athletes" 
          value="92" 
          icon={<Users className="text-purple-500" />} 
          trend="Current Session"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN CHART AREA (Placeholder for Recharts/Chart.js) */}
        <div className="lg:col-span-2 bg-white rounded-[45px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-fbNavy uppercase italic text-xl tracking-tight">Activity Volume</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weekly Student Submissions</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-fbGray rounded-lg text-[9px] font-black uppercase tracking-widest">Weekly</span>
              <span className="px-4 py-2 text-gray-300 text-[9px] font-black uppercase tracking-widest">Monthly</span>
            </div>
          </div>
          
          {/* PLACEHOLDER FOR ACTUAL GRAPH */}
          <div className="h-64 w-full bg-fbGray/5 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 size={40} className="text-gray-200 mx-auto mb-2" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Graph Data Syncing...</p>
            </div>
          </div>
        </div>

        {/* SIDEBAR: RECENT ACHIEVEMENTS */}
        <div className="flex flex-col gap-8">
          <div className="bg-fbNavy rounded-[40px] p-8 text-white">
            <h3 className="font-black uppercase italic text-lg mb-6 flex items-center gap-3">
              <Calendar size={20} className="text-fbOrange" />
              Deadlines
            </h3>
            <div className="space-y-6">
              <DeadlineItem title="Midterm Logs" date="April 25" status="Urgent" />
              <DeadlineItem title="Cardio Assessment" date="May 02" status="Upcoming" />
              <DeadlineItem title="Final Submission" date="May 20" status="Scheduled" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
             <h3 className="font-black text-fbNavy uppercase italic text-lg mb-4">Quick Stats</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Logs</span>
                   <span className="text-sm font-black text-fbNavy italic">1,402</span>
                </div>
                <div className="h-1.5 w-full bg-fbGray rounded-full overflow-hidden">
                   <div className="h-full bg-fbOrange w-[75%]" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}

function InsightCard({ label, value, icon, trend, positive }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-fbGray/10 rounded-2xl group-hover:bg-fbNavy group-hover:text-white transition-all">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${positive ? 'text-green-500' : 'text-gray-400'}`}>
          {positive && <ArrowUpRight size={12} />}
          {trend}
        </div>
      </div>
      <h2 className="text-3xl font-black text-fbNavy italic tracking-tighter mb-1">{value}</h2>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

function DeadlineItem({ title, date, status }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-black italic">{title}</p>
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{date}</p>
      </div>
      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${status === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
        {status}
      </span>
    </div>
  );
}
