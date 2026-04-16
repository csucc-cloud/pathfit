// src/pages/module/[type].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ExerciseCard from '../../components/ExerciseCard';
import RoleGuard from '../../components/RoleGuard'; 
import { PATHFIT_EXERCISES } from '../../constants/exercises';
import { useExerciseLog } from '../../hooks/useExerciseLog';
import { supabase } from '../../lib/supabaseClient';
import { 
  Dumbbell, 
  Save, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  Trophy,
  Activity,
  Lock,
  AlertCircle
} from 'lucide-react';

export default function PracticumLog() {
  const router = useRouter();
  const { type } = router.query; 
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);
      }
    };
    getUser();
  }, [router]);

  const { logData, setLogData, saveLogs, loading, metadata } = useExerciseLog(type, user?.id);

  const completedCount = Object.keys(logData).length;

  const isExpired = () => {
    if (!profile?.pre_test_submitted_at || type === 'pre') return false;
    
    const start = new Date(profile.pre_test_submitted_at);
    const now = new Date();
    const weekNum = parseInt(type);
    
    if (isNaN(weekNum)) return false; 

    const openDate = new Date(start.getTime() + (weekNum * 7 * 24 * 60 * 60 * 1000));
    const expiryDate = new Date(openDate.getTime() + (11 * 24 * 60 * 60 * 1000));
    
    return now > expiryDate;
  };

  const isLocked = metadata?.is_submitted || isExpired();

  const handleInputChange = (exId, setKey, value) => {
    if (isLocked) return; 
    setLogData((prev) => ({
      ...prev,
      [exId]: { ...prev[exId], [setKey]: value },
    }));
  };

  const handleFinalSubmit = async () => {
    const confirm = window.confirm("FINAL SUBMISSION: Once submitted, you cannot edit this record again. Proceed?");
    if (confirm) {
      // UPDATED: Explicitly define the log type and test name for the profile progress tracker
      const isPre = type === 'pre';
      const isPost = type === 'post';
      const isAssessment = isPre || isPost;

      await saveLogs({ 
        submitted: true, 
        isPreTest: isPre,
        isPostTest: isPost,
        // Ensure these match the filters in profile.js
        log_type: isAssessment ? 'assessment' : 'workout',
        test_name: isPre ? 'Pre-Test' : isPost ? 'Post-Test' : null,
        week_number: isAssessment ? null : parseInt(type)
      });

      if (isPre) {
        await supabase.from('profiles').update({ 
          pre_test_submitted_at: new Date().toISOString(),
          pre_test_completed: true 
        }).eq('id', user.id);
      }
      
      // Redirecting to profile so user can see their progress immediately
      router.push('/studprofile/profile');
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-fbOrange" />
          <p className="text-fbNavy font-bold animate-pulse">Syncing fitness profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <RoleGuard allowedRole="student">
      <Layout>
        <main className="p-4 md:p-10 max-w-7xl mx-auto">
          
          {isLocked && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <Lock className="text-red-500 w-6 h-6" />
              <div>
                <p className="text-red-800 font-black text-sm uppercase italic">Module Locked</p>
                <p className="text-red-600 text-xs font-medium">This record has been submitted or the time limit has expired. Editing is disabled.</p>
              </div>
            </div>
          )}

          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div>
              <nav className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Trophy className="w-3 h-3 text-fbAmber" />
                University Fitness Curriculum • {type === 'pre' ? 'Initial Assessment' : type === 'post' ? 'Final Assessment' : `Weekly Progress`}
              </nav>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-fbNavy" />
                </button>
                <h2 className="text-3xl font-extrabold text-fbNavy flex items-center gap-3 capitalize">
                  <Dumbbell className="text-fbOrange w-8 h-8" />
                  {type === 'pre' || type === 'post' ? `${type}-Test` : `Weekly Log: Week ${type}`}
                </h2>
              </div>
              
              <div className="flex items-center gap-4 mt-4 bg-white/50 p-2 rounded-2xl border border-white/20 inline-flex">
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2 ml-2">
                  <Activity className="w-4 h-4 text-fbOrange" />
                  Progress
                </p>
                <div className="w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-fbOrange h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,124,0,0.5)]"
                    style={{ width: `${(completedCount / 15) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-fbOrange uppercase flex items-center gap-1 pr-2">
                  <CheckCircle2 className="w-3 h-3" />
                  {completedCount} / 15 DONE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isLocked ? (
                <button
                  onClick={handleFinalSubmit}
                  className="bg-fbOrange hover:bg-fbOrange/90 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-fbOrange/20 transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap group"
                >
                  <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Final Submission
                </button>
              ) : (
                <div className="bg-gray-100 text-gray-400 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 cursor-not-allowed border border-gray-200">
                  <Lock className="w-5 h-5" />
                  Record Sealed
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {PATHFIT_EXERCISES.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                values={logData[ex.id]}
                onChange={handleInputChange}
                disabled={isLocked}
              />
            ))}
          </div>
        </main>
      </Layout>
    </RoleGuard>
  );
}
