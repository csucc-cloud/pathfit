import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EXERCISES } from '../../constants/exercises';
import Layout from '../../components/ui/Layout';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, RefreshCw, Lock, 
  ChevronRight, Activity, ShieldCheck, 
  Dumbbell, AlertCircle 
} from 'lucide-react';
import styles from '../../styles/pretest.module.css';

export default function PreTest() {
  const router = useRouter();
  const [results, setResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    checkPhaseStatus();
  }, []);

  const checkPhaseStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: existingLogs } = await supabase
      .from('performance_logs')
      .select('*')
      .eq('student_id', user.id)
      .eq('phase', 1);

    if (existingLogs && existingLogs.length > 0) {
      setHasCompleted(true);
      const savedResults = {};
      existingLogs.forEach(log => {
        savedResults[`${log.exercise_id}_set1`] = log.set_1;
        savedResults[`${log.exercise_id}_set2`] = log.set_2;
        savedResults[`${log.exercise_id}_set3`] = log.set_3;
      });
      setResults(savedResults);
    }

    const accountCreated = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - accountCreated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 10) {
      setIsLockedOut(true);
    }
    
    setLoadingStatus(false);
  };

  const handleUpdate = (id, setNum, value) => {
    if (hasCompleted || isLockedOut) return;
    setResults(prev => ({
      ...prev,
      [`${id}_set${setNum}`]: value
    }));
  };

  const calculateMean = (id) => {
    const s1 = parseFloat(results[`${id}_set1`]) || 0;
    const s2 = parseFloat(results[`${id}_set2`]) || 0;
    const s3 = parseFloat(results[`${id}_set3`]) || 0;
    const values = [s1, s2, s3].filter(v => v > 0);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : "0.0";
  };

  const savePreTest = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please log in first!");
      setIsSubmitting(false);
      return;
    }

    const logs = EXERCISES.map(ex => ({
      student_id: user.id,
      exercise_id: ex.id,
      phase: 1,
      set_1: parseFloat(results[`${ex.id}_set1`]) || 0,
      set_2: parseFloat(results[`${ex.id}_set2`]) || 0,
      set_3: parseFloat(results[`${ex.id}_set3`]) || 0,
    }));

    const { error } = await supabase.from('performance_logs').insert(logs);

    if (error) {
      alert("Error saving: " + error.message);
      setIsSubmitting(false);
    } else {
      setHasCompleted(true);
      setIsSubmitting(false);
      alert("✅ Baseline Locked.");
    }
  };

  if (loadingStatus) return <Layout><div className="flex h-screen items-center justify-center font-bold text-[#039be5] animate-pulse">LOADING...</div></Layout>;

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      <div className="max-w-[1400px] mx-auto px-6 pb-40">
        
        {/* HEADER SECTION - Matching Reference Style */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-12 gap-8 border-b border-slate-100 mb-12">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">University Fitness Curriculum • Semester 1</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Exercise Log: <span className="text-[#039be5]">Practicum 1</span>
            </h1>
            <p className="text-slate-500 text-sm">Complete your baseline diagnostic sets to track progress.</p>
          </div>

          <div className="flex items-center gap-4">
            {!hasCompleted ? (
              <button 
                onClick={savePreTest}
                disabled={isSubmitting}
                className="flex items-center gap-3 bg-[#039be5] hover:bg-[#01579b] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" /> : <ShieldCheck />}
                Sync Baseline & Lock
              </button>
            ) : (
              <button 
                onClick={() => router.push('/phase/2-weekly-logs')}
                className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
              >
                Go to Weekly Logs <ChevronRight />
              </button>
            )}
          </div>
        </div>

        {/* CARDS GRID - 3 Columns like the screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXERCISES.map((ex) => (
            <div key={ex.id} className={styles.exerciseCard}>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Target: {ex.goal || 'Max Effort'}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${hasCompleted ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'}`}>
                  {hasCompleted ? <Lock size={20} /> : <Dumbbell size={20} />}
                </div>
              </div>

              {/* SET INPUTS - Horizontal Grid */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block text-center">Set {s}</label>
                    <input 
                      type="number" 
                      disabled={hasCompleted || isLockedOut || (ex.sets < s)}
                      value={results[`${ex.id}_set${s}`] || ""}
                      placeholder={ex.sets < s ? "—" : "0"}
                      className={`${styles.setInput} ${styles.noSpinners}`}
                      onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* FOOTER STATS */}
              <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mean Diagnostic</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 italic tracking-tighter">
                      {calculateMean(ex.id)}
                    </span>
                    <span className="text-[10px] font-black text-[#039be5] uppercase italic">{ex.unit || 'Reps'}</span>
                  </div>
                </div>
                {results[`${ex.id}_set1`] ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <Clock size={20} className="text-slate-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc !important; }
      `}</style>
    </Layout>
  );
}    const s3 = parseFloat(results[`${id}_set3`]) || 0;
    const values = [s1, s2, s3].filter(v => v > 0);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : "0.0";
  };

  const savePreTest = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please log in first!");
      setIsSubmitting(false);
      return;
    }

    const logs = EXERCISES.map(ex => ({
      student_id: user.id,
      exercise_id: ex.id,
      phase: 1,
      set_1: parseFloat(results[`${ex.id}_set1`]) || 0,
      set_2: parseFloat(results[`${ex.id}_set2`]) || 0,
      set_3: parseFloat(results[`${ex.id}_set3`]) || 0,
    }));

    const { error } = await supabase.from('performance_logs').insert(logs);

    if (error) {
      alert("Error saving: " + error.message);
      setIsSubmitting(false);
    } else {
      setHasCompleted(true);
      setIsSubmitting(false);
      alert("✅ Baseline Assessment Synced and Locked!");
    }
  };

  if (loadingStatus) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-[#039be5] mb-4" size={32} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Validating Session...</p>
      </div>
    </Layout>
  );

  if (isLockedOut && !hasCompleted) {
    return (
      <Layout title="Phase 1: Expired">
        <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2.5rem] shadow-xl text-center border border-red-50">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Window Closed</h1>
          <p className="text-gray-500 mt-4 text-sm leading-relaxed">The 10-day baseline submission period has ended.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      <div className="max-w-[1400px] mx-auto px-6 pb-40">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-12 gap-8 border-b border-slate-100 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-lg">
              <Activity size={14} className="text-[#039be5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Session 01</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Performance <span className="text-[#039be5]">Baseline</span>
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-2xl border-l-4 border-[#039be5] pl-4">
              Establishing your initial biometric output. This data serves as the foundation for your semester growth curve.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!hasCompleted ? (
              <button 
                onClick={savePreTest}
                disabled={isSubmitting}
                className="flex items-center gap-4 bg-[#039be5] hover:bg-[#01579b] text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(3,155,229,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                Authorize & Lock Baseline
              </button>
            ) : (
              <button 
                onClick={() => router.push('/phase/2-weekly-logs')}
                className="flex items-center gap-4 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95"
              >
                Enter Training Phase <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {EXERCISES.map((ex) => (
            <div 
              key={ex.id} 
              className={`${styles.exerciseCard} ${hasCompleted ? 'opacity-80' : ''}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                       Target: {ex.goal || 'Max Effort'}
                     </span>
                     <span className="bg-blue-50 text-[#039be5] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                       {ex.sets} Sets Required
                     </span>
                  </div>
                </div>
                <div className={`p-4 rounded-[1.25rem] shadow-sm ${hasCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  {hasCompleted ? <Lock size={22} /> : <Dumbbell size={22} />}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="space-y-3">
                    <div className="flex items-center justify-center gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Set {s}</label>
                    </div>
                    <input 
                      type="number" 
                      disabled={hasCompleted || isLockedOut || (ex.sets < s)}
                      value={results[`${ex.id}_set${s}`] || ""}
                      placeholder={ex.sets < s ? "—" : "0"}
                      className={`${styles.setInput} ${styles.noSpinners}`}
                      onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mean Diagnostic</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 italic tracking-tighter">
                      {calculateMean(ex.id)}
                    </span>
                    <span className="text-xs font-black text-[#039be5] uppercase tracking-widest italic">{ex.unit || 'Reps'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100">
                  {results[`${ex.id}_set1`] ? (
                     <CheckCircle2 size={24} className="text-green-500" />
                  ) : (
                     <div className="h-3 w-3 bg-slate-200 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc !important; }
      `}</style>
    </Layout>
  );
}
