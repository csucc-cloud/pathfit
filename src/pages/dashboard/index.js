// src/pages/dashboard.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import RoleGuard from '../../components/RoleGuard';
import { supabase } from '../../lib/supabaseClient';
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
  ClipboardCheck
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
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
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
    setLoading(false);
  };

  // LOGIC: The 11-day locking and 7-day opening rule
  const getModuleStatus = (weekNum) => {
    // If Pre-test isn't done, everything else is locked
    if (!profile?.pre_test_submitted_at) return 'LOCKED';
    
    const start = new Date(profile.pre_test_submitted_at);
    const now = new Date();
    
    // Week N opens at (N * 7) days and expires at (N * 7 + 11) days
    const openDate = new Date(start.getTime() + (weekNum * 7 * 24 * 60 * 60 * 1000));
    const expiryDate = new Date(openDate.getTime() + (11 * 24 * 60 * 60 * 1000));

    if (now < openDate) return 'LOCKED';
    if (now > expiryDate) return 'EXPIRED';
    return 'OPEN';
  };

  // LOGIC: Post-test specifically unlocks only after 8 weeks (56 days) of logs are done
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

  // Helper check for the overlay
  const isPreTestFinished = !!profile?.pre_test_submitted_at;

  return (
    <RoleGuard allowedRole="student">
      <Layout>
        <main className="min-h-screen bg-fbGray">
          <div className="p-4 md:p-10 max-w-5xl mx-auto pb-16">

            {/* Header Section */}
            <header className="mb-10 pt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-fbAmber/20 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-fbAmber" />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Student Portal</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-fbNavy uppercase tracking-tight leading-none mb-2">
                My Fitness<br className="hidden sm:block" /> Journey
              </h1>
              <p className="text-gray-500 font-medium mt-3 text-sm">Track your progress and complete weekly modules on time.</p>
            </header>

            {/* Progress Overview Card */}
            <div className="relative bg-fbNavy rounded-3xl p-6 md:p-8 mb-10 text-white shadow-2xl shadow-fbNavy/25 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Decorative background ring */}
              <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border-[20px] border-white/5 pointer-events-none" />
              <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full border-[12px] border-fbOrange/10 pointer-events-none" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl ring-1 ring-white/10">
                  <Activity className="w-7 h-7 text-fbOrange" />
                </div>
                <div>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Overall Status</p>
                  <h3 className="text-xl md:text-2xl font-black leading-tight">
                    {isPreTestFinished ? "Curriculum in Progress" : "Awaiting Pre-Test"}
                  </h3>
                </div>
              </div>

              {isPreTestFinished && (
                <div className="text-right relative z-10">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Started On</p>
                  <div className="flex items-center gap-2 font-mono text-fbOrange font-bold text-sm bg-white/10 px-4 py-2.5 rounded-xl ring-1 ring-white/10">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(profile.pre_test_submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            {/* Module Grid Section */}
            <div className="grid gap-3">
              {/* Pre-Test Module - Always Visible/Accessible until complete */}
              <ModuleCard 
                title="Initial Pre-Test" 
                subtitle="Mandatory baseline assessment"
                href="/module/pre" 
                status={isPreTestFinished ? 'COMPLETED' : 'OPEN'} 
              />

              {/* WRAPPER FOR PROTECTED CONTENT */}
              <div className="relative mt-4">
                
                {/* LOCK OVERLAY: Flashes if pre-test is missing */}
                {!isPreTestFinished && (
                  <div className="absolute inset-x-0 -inset-y-4 z-20 backdrop-blur-md bg-white/40 rounded-3xl flex items-center justify-center p-6 border-2 border-dashed border-fbOrange/30">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm animate-in zoom-in duration-300 border border-gray-100">
                      <div className="w-16 h-16 bg-fbOrange/10 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6">
                        <ClipboardCheck className="text-fbOrange w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-fbNavy mb-2">Weekly Logs Locked</h3>
                      <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6">
                        Please fill out the <span className="text-fbOrange">Initial Pre-test</span> to proceed with the Weekly Logs.
                      </p>
                      <button 
                        onClick={() => router.push('/module/pre')}
                        className="w-full bg-fbNavy text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-fbOrange transition-all active:scale-95 shadow-lg shadow-fbNavy/20"
                      >
                        Complete Pre-test Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Weekly Logs Grid (Blurred when locked) */}
                <div className={!isPreTestFinished ? 'opacity-40 grayscale pointer-events-none select-none' : ''}>
                  <div className="py-4 flex items-center gap-4">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Weekly Logs</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="grid gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                      <ModuleCard 
                        key={week}
                        title={`Weekly Log: Week ${week}`}
                        subtitle={`7-day cycle fitness tracking`}
                        href={`/module/${week}`}
                        status={getModuleStatus(week)}
                      />
                    ))}

                    <div className="py-4 flex items-center gap-4">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Final Assessment</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    {/* Post-Test Card with secondary time-lock logic */}
                    <div className="relative">
                      {!isPostTestUnlocked() && isPreTestFinished && (
                        <div className="absolute inset-0 z-10 bg-fbGray/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center border border-dashed border-gray-300">
                          <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                            <Lock className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Unlocks after Week 8</span>
                          </div>
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
          <h4 className="font-black text-base md:text-lg tracking-tight leading-snug">{title}</h4>
          <p className="text-xs font-medium opacity-60 mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <div className={`hidden md:flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadgeStyles[status]}`}>
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
