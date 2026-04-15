import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EXERCISES } from '../../constants/exercises';
import Layout from '../../components/ui/Layout';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, RefreshCw, Lock, 
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

  useEffect(() => { checkPhaseStatus(); }, []);

  const checkPhaseStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: existingLogs } = await supabase
      .from('performance_logs')
      .select('*')
      .eq('student_id', user.id)
      .eq('phase', 1);

    if (existingLogs?.length > 0) {
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
    const diffDays = Math.ceil(Math.abs(new Date() - accountCreated) / (1000 * 60 * 60 * 24));
    if (diffDays > 10) setIsLockedOut(true);
    setLoadingStatus(false);
  };

  const handleUpdate = (id, setNum, value) => {
    if (hasCompleted || isLockedOut) return;
    setResults(prev => ({ ...prev, [`${id}_set${setNum}`]: value }));
  };

  const calculateMean = (id) => {
    const values = [
      parseFloat(results[`${id}_set1`]),
      parseFloat(results[`${id}_set2`]),
      parseFloat(results[`${id}_set3`])
    ].filter(v => !isNaN(v) && v > 0);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : "0.0";
  };

  const savePreTest = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const logs = EXERCISES.map(ex => ({
      student_id: user.id, exercise_id: ex.id, phase: 1,
      set_1: parseFloat(results[`${ex.id}_set1`]) || 0,
      set_2: parseFloat(results[`${ex.id}_set2`]) || 0,
      set_3: parseFloat(results[`${ex.id}_set3`]) || 0,
    }));
    const { error } = await supabase.from('performance_logs').insert(logs);
    if (!error) { setHasCompleted(true); alert("✅ Progress Saved Successfully!"); }
    setIsSubmitting(false);
  };

  if (loadingStatus) return <Layout><div className="flex h-screen items-center justify-center font-bold text-slate-400">LOADING CURRICULUM...</div></Layout>;

  return (
    <Layout title="Phase 1: Pre-Test">
      <div className="max-w-[1500px] mx-auto px-8 pb-32 bg-[#fcfdfe]">
        
        {/* TOP ACTION BAR */}
        <div className="flex items-center justify-between py-10 border-b border-slate-100 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Exercise Log: Practicum 1</h1>
            <p className="text-slate-400 text-sm mt-1">Complete your daily sets to track progress.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={savePreTest} className="flex items-center gap-2 bg-[#039be5] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0288d1] transition-colors shadow-sm">
                <ShieldCheck size={18} /> {hasCompleted ? 'Locked' : 'Save Changes'}
             </button>
          </div>
        </div>

        {/* 3-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXERCISES.map((ex) => (
            <div key={ex.id} className={styles.exerciseCard}>
              {/* Card Header */}
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-slate-800 leading-tight">{ex.name}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                  TARGET: {ex.goal || '8 REPS'} • {ex.sets} SETS
                </p>
              </div>

              {/* Set Inputs Row */}
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2 ml-1">SET {s}</span>
                    <input 
                      type="number" 
                      disabled={hasCompleted || isLockedOut || (ex.sets < s)}
                      value={results[`${ex.id}_set${s}`] || ""}
                      placeholder="-"
                      className={`${styles.setInput} ${styles.noSpinners}`}
                      onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Mean Calculation (Optional but helpful) */}
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Mean Performance</span>
                 <span className="text-sm font-bold text-[#039be5]">{calculateMean(ex.id)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
