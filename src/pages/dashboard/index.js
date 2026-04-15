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
  Loader2
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

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-fbOrange" />
          <p className="text-fbNavy font-bold animate-pulse">Loading Fitness Curriculum...</p>
        </div>
      </Layout>
    );
  }

  return (
    <RoleGuard allowedRole="student">
      <Layout>
        <main className="p-4 md:p-10 max-w-5xl mx-auto">
          {/* Header Section */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-fbAmber" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Student Portal</span>
            </div>
            <h1 className="text-4xl font-black text-fbNavy uppercase tracking-tight">My Fitness Journey</h1>
            <p className="text-gray-500 font-medium mt-1">Track your progress and complete weekly modules on time.</p>
          </header>

          {/* Progress Overview Card */}
          <div className="bg-fbNavy rounded-3xl p-6 mb-10 text-white shadow-xl shadow-fbNavy/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/10 rounded-2xl">
                <Activity className="w-8 h-8 text-fbOrange" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-bold uppercase tracking-wider">Overall Status</p>
                <h3 className="text-2xl font-black">
                  {profile?.pre_test_submitted_at ? "Curriculum in Progress" : "Awaiting Pre-Test"}
                </h3>
              </div>
            </div>
            {profile?.pre_test_submitted_at && (
              <div className="text-right">
                <p className="text-white/60 text-xs font-bold uppercase mb-1">Started On</p>
                <div className="flex items-center gap-2 font-mono text-fbOrange font-bold">
                  <Calendar className="w-4 h-4" />
                  {new Date(profile.pre_test_submitted_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Module Grid */}
          <div className="grid gap-4">
            {/* Pre-Test Module */}
            <ModuleCard 
              title="Initial Pre-Test" 
              subtitle="Mandatory baseline assessment"
              href="/module/pre" 
              status={profile?.pre_test_submitted_at ? 'COMPLETED' : 'OPEN'} 
            />

            <div className="py-4 flex items-center gap-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Weekly Logs</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* Weekly Modules 1-8 */}
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

            {/* Post-Test Card */}
            <ModuleCard 
              title="Final Post-Test" 
              subtitle="End of semester comparison"
              href="/module/post" 
              status={getModuleStatus(9) === 'OPEN' ? 'OPEN' : 'LOCKED'} 
            />
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

  const icons = {
    LOCKED: <Lock className="w-6 h-6" />,
    OPEN: <PlayCircle className="w-6 h-6 text-fbOrange animate-pulse" />,
    COMPLETED: <CheckCircle2 className="w-6 h-6 text-green-500" />,
    EXPIRED: <AlertTriangle className="w-6 h-6 text-red-500" />
  };

  const Content = (
    <div className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 ${styles[status]}`}>
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl bg-white shadow-sm border border-inherit`}>
          {icons[status]}
        </div>
        <div>
          <h4 className="font-black text-lg tracking-tight">{title}</h4>
          <p className="text-xs font-medium opacity-60">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-40">Status</span>
          <span className="text-xs font-bold uppercase">{status}</span>
        </div>
        {status !== 'LOCKED' && <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />}
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
