// src/pages/dashboard.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import RoleGuard from '../../components/RoleGuard';
import { supabase } from '../../lib/supabaseClient';
import { PATHFIT_EXERCISES } from '../../constants/exercises'; // Added for Benchmarks
import { 
  Lock, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertTriangle,
  Trophy,
  Calendar,
  ChevronRight,
  Activity,
  Loader2,
  ClipboardCheck,
  TrendingUp,
  Zap,
  Dumbbell
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [exerciseLogs, setExerciseLogs] = useState([]); // Added for Benchmarks
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Fetch Profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    // Fetch Logs for the summary table
    const { data: logData } = await supabase.from('exercise_logs')
      .select('*')
      .eq('student_id', user.id);
    setExerciseLogs(logData || []);

    setLoading(false);
  };

  // LOGIC: The 11-day locking and 7-day opening rule
  const getModuleStatus = (weekNum) => {
    if (!profile?.pre_test_submitted_at) return 'LOCKED';
    const start = new Date(profile.pre_test_submitted_at);
    const now = new Date();
    const openDate = new Date(start.getTime() + (weekNum * 7 * 24 * 60 * 60 * 1000));
    const expiryDate = new Date(openDate.getTime() + (11 * 24 * 60 * 60 * 1000));
    if (now < openDate) return 'LOCKED';
    if (now > expiryDate) return 'EXPIRED';
    return 'OPEN';
  };

  const isPostTestUnlocked = () => {
    if (!profile?.pre_test_submitted_at) return false;
    const start = new Date(profile.pre_test_submitted_at);
    const now = new Date();
    const unlockDate = new Date(start.getTime() + (8 * 7 * 24 * 60 * 60 * 1000)); 
    return now >= unlockDate;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-fbGray">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-fbNavy flex items-center justify-center shadow-2xl shadow-fbNavy/30">
              <Loader2 className="h-9 w-9 animate-spin text-fbOrange" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fbOrange animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-fbNavy font-black text-sm uppercase tracking-[0.2em] animate-pulse">Loading Fitness Curriculum</p>
            <p className="text-gray-400 text-xs mt-1 font-medium">Preparing your journey...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isPreTestFinished = !!profile?.pre_test_submitted_at;
  const totalCalories = exerciseLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);

  return (
    <RoleGuard allowedRole="student">
      <Layout>
        {/* Custom Scrollbar Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF6B00; }
        `}} />

        <main className="min-h-screen bg-fbGray">
          <div className="p-4 md:p-10 max-w-6xl mx-auto pb-16">

            {/* Header Section */}
            <header className="mb-10 pt-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-fbAmber/20 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-fbAmber" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Training Dashboard</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-fbNavy uppercase tracking-tight leading-none">
                  Athlete<br className="hidden sm:block" /> Command
                </h1>
              </div>
              <Link href="/profile" className="bg-white text-fbNavy px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 shadow-sm hover:bg-fbNavy hover:text-white transition-all">
                View Full Analytics
              </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Modules & Progress */}
              <div className="lg:col-span-7 space-y-6">
                <div className="relative bg-fbNavy rounded-[35px] p-8 text-white shadow-2xl shadow-fbNavy/25 overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border-[20px] border-white/5 pointer-events-none" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Weekly Progression</p>
                      <h3 className="text-2xl font-black">
                        {isPreTestFinished ? "Curriculum Active" : "Action Required"}
                      </h3>
                    </div>
                    {isPreTestFinished && (
                       <div className="bg-fbOrange px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fbOrange/20">
                         {exerciseLogs.length} Logs Filed
                       </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 relative z-10">
                    <Zap className="text-fbOrange shrink-0" size={20} />
                    <p className="text-xs font-medium text-white/80">
                      {isPreTestFinished 
                        ? "Ensure you complete your weekly workout logs before the 11-day window expires." 
                        : "Your fitness journey is currently paused. Submit the Pre-test assessment to unlock Week 1."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <ModuleCard 
                    title="Initial Pre-Test" 
                    subtitle="Mandatory baseline assessment"
                    href="/module/pre" 
                    status={isPreTestFinished ? 'COMPLETED' : 'OPEN'} 
                  />

                  <div className="relative mt-4">
                    {!isPreTestFinished && (
                      <div className="absolute inset-x-0 -inset-y-4 z-20 backdrop-blur-md bg-white/40 rounded-3xl flex items-center justify-center p-6 border-2 border-dashed border-fbOrange/30">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-gray-100">
                          <ClipboardCheck className="text-fbOrange w-8 h-8 mx-auto mb-4" />
                          <h3 className="text-lg font-black text-fbNavy mb-2">Modules Locked</h3>
                          <button onClick={() => router.push('/module/pre')} className="w-full bg-fbNavy text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Start Pre-test</button>
                        </div>
                      </div>
                    )}

                    <div className={!isPreTestFinished ? 'opacity-40 grayscale pointer-events-none' : ''}>
                      <div className="grid gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                          <ModuleCard 
                            key={week}
                            title={`Weekly Log: Week ${week}`}
                            subtitle={`Cycle tracking for Week ${week}`}
                            href={`/module/${week}`}
                            status={getModuleStatus(week)}
                          />
                        ))}
                        <div className="relative mt-4">
                          {!isPostTestUnlocked() && isPreTestFinished && (
                            <div className="absolute inset-0 z-10 bg-fbGray/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center border border-dashed border-gray-300">
                               <span className="text-[10px] font-black text-gray-400 uppercase bg-white px-3 py-1 rounded-full shadow-sm">Unlocks after Week 8</span>
                            </div>
                          )}
                          <ModuleCard 
                            title="Final Post-Test" 
                            subtitle="End of semester comparison"
                            href="/module/post" 
                            status={isPostTestUnlocked() ? 'OPEN' : 'LOCKED'} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Quick Benchmarks Summary (UNIQUE TO DASHBOARD) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ENERGY SCORE CARD */}
                <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-fbOrange/10 text-fbOrange rounded-2xl flex items-center justify-center">
                      <Flame size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Energy</p>
                      <h4 className="text-2xl font-black text-fbNavy">{totalCalories.toLocaleString()} <span className="text-xs text-fbOrange">KCAL</span></h4>
                    </div>
                  </div>
                </div>

                {/* SCROLLABLE BENCHMARK SUMMARY */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-fbNavy uppercase tracking-[0.3em] flex items-center gap-3">
                      <TrendingUp size={18} className="text-fbOrange" /> Peak Performance
                    </h3>
                  </div>

                  <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="text-[10px] text-gray-300 uppercase tracking-widest">
                          <th className="pb-4 font-black border-b border-gray-50">Exercise</th>
                          <th className="pb-4 font-black text-center border-b border-gray-50">Peak</th>
                          <th className="pb-4 text-right font-black border-b border-gray-50">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-black text-fbNavy">
                        {PATHFIT_EXERCISES.map((ex) => {
                          const logs = exerciseLogs.filter(l => l.exercise_id === ex.id);
                          const peak = logs.length > 0 ? Math.max(...logs.map(l => l.set_1_val || 0)) : 0;
                          
                          return (
                            <tr key={ex.id} className="group transition-colors">
                              <td className="py-4 text-gray-500 font-bold group-hover:text-fbNavy text-xs">{ex.name}</td>
                              <td className="py-4 text-center text-fbOrange">{peak || "--"}</td>
                              <td className="py-4 text-right">
                                {peak > 0 ? (
                                  <CheckCircle2 size={14} className="text-green-500 ml-auto" />
                                ) : (
                                  <Clock size={14} className="text-gray-200 ml-auto" />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* QUICK NAV CARD */}
                <div className="bg-gradient-to-br from-fbNavy to-blue-900 p-8 rounded-[35px] text-white relative overflow-hidden group shadow-xl">
                  <Dumbbell className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" size={100} />
                  <h4 className="text-lg font-black mb-2 italic">Need Help?</h4>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed">Check the exercise library for tutorials on proper form and techniques.</p>
                  <Link href="/library" className="inline-flex items-center gap-2 text-fbOrange text-[10px] font-black uppercase tracking-widest">
                    Open Library <ChevronRight size={14} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </main>
      </Layout>
    </RoleGuard>
  );
}

function ModuleCard({ title, subtitle, href, status }) {
  const styles = {
    LOCKED: "bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed",
    OPEN: "bg-white border-fbOrange text-fbNavy hover:shadow-xl hover:shadow-fbOrange/10 hover:-translate-y-1",
    COMPLETED: "bg-green-50/50 border-green-200 text-green-700",
    EXPIRED: "bg-red-50/50 border-red-100 text-red-700"
  };

  const statusBadgeStyles = {
    LOCKED: "bg-gray-100 text-gray-400",
    OPEN: "bg-fbOrange/10 text-fbOrange",
    COMPLETED: "bg-green-100 text-green-600",
    EXPIRED: "bg-red-100 text-red-500"
  };

  const icons = {
    LOCKED: <Lock className="w-5 h-5" />,
    OPEN: <PlayCircle className="w-5 h-5 text-fbOrange animate-pulse" />,
    COMPLETED: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    EXPIRED: <AlertTriangle className="w-5 h-5 text-red-500" />
  };

  const Content = (
    <div className={`group flex items-center justify-between p-5 md:p-6 rounded-3xl border-2 transition-all duration-300 ${styles[status]}`}>
      <div className="flex items-center gap-4 md:gap-5">
        <div className="p-3 rounded-2xl bg-white shadow-sm border border-inherit flex-shrink-0">
          {icons[status]}
        </div>
        <div>
          <h4 className="font-black text-sm md:text-base tracking-tight leading-snug">{title}</h4>
          <p className="text-[10px] font-medium opacity-60 mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <div className={`hidden md:flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusBadgeStyles[status]}`}>
          {status}
        </div>
        {status !== 'LOCKED' && (
          <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />
        )}
      </div>
    </div>
  );

  if (status === 'LOCKED') return Content;

  return (
    <Link href={href} className="block">
      {Content}
    </Link>
  );
}
