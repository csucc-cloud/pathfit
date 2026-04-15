import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EXERCISES } from '../../constants/exercises';
import Layout from '../../components/ui/Layout';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, RefreshCw, Lock, Clock,
  ChevronRight, Activity, ShieldCheck, Dumbbell 
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
    const diffDays = Math.ceil(Math.abs(now - accountCreated) / (1000 * 60 * 60 * 24));

    if (diffDays > 10) setIsLockedOut(true);
    setLoadingStatus(false);
  };

  const handleUpdate = (id, setNum, value) => {
    if (hasCompleted || isLockedOut) return;
    setResults(prev => ({ ...prev, [`${id}_set${setNum}`]: value }));
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
    if (!user) return setIsSubmitting(false);

    const logs = EXERCISES.map(ex => ({
      student_id: user.id,
      exercise_id: ex.id,
      phase: 1,
      set_1: parseFloat(results[`${ex.id}_set1`]) || 0,
      set_2: parseFloat(results[`${ex.id}_set2`]) || 0,
      set_3: parseFloat(results[`${ex.id}_set3`]) || 0,
    }));

    const { error } = await supabase.from('performance_logs').insert(logs);
    if (!error) {
      setHasCompleted(true);
      alert("✅ Baseline Assessment Locked.");
    }
    setIsSubmitting(false);
  };

  if (loadingStatus) return <Layout><div className="flex h-screen items-center justify-center font-black text-[#039be5] animate-pulse">SYNCING DATA...</div></Layout>;

  return (
    <Layout title="Phase 1: Pre-Test">
      <div className="max-w-[1400px] mx-auto px-6 pb-40">
        
        {/* HEADER AREA */}
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
                className="flex items-center gap-3 bg-[#039be5] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#01579b] transition-all"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" /> : <ShieldCheck />} Sync Baseline & Lock
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

        {/* EXERCISE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXERCISES.map((ex) => (
            <div key={ex.id} className={styles.exerciseCard}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{ex.name}</h3>
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest mt-2 block w-fit">
                    Target: {ex.goal || 'Max Effort'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-300">
                   <Dumbbell size={20} />
                </div>
              </div>

              {/* INPUTS */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase block text-center">Set {s}</label>
                    <input 
                      type="number" 
                      disabled={hasCompleted || isLockedOut || (ex.sets < s)}
                      value={results[`${ex.id}_set${s}`] || ""}
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
                    <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{calculateMean(ex.id)}</span>
                    <span className="text-[10px] font-black text-[#039be5] uppercase italic">{ex.unit || 'Reps'}</span>
                  </div>
                </div>
                {results[`${ex.id}_set1`] ? <CheckCircle2 size={20} className="text-green-500" /> : <Clock size={20} className="text-slate-200" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
