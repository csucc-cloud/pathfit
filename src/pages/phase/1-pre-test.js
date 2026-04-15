import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EXERCISES } from '../../constants/exercises';
import Layout from '../../components/ui/Layout';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Clock, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  Dumbbell,
  AlertCircle
} from 'lucide-react';
import styles from './styles/pretest.css';

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

    // Check if Phase 1 is already completed
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

    // 10-Day Deadline Logic
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
          <p className="text-gray-500 mt-4 text-sm leading-relaxed">The 10-day baseline submission period has ended. You can no longer submit or edit Phase 1 data.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      <div className="max-w-[1400px] mx-auto px-4 pb-40">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between py-10 gap-6 border-b border-gray-100 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#039be5]/10 text-[#039be5] text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Phase 1</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Institutional Fitness Curriculum</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
              Baseline <span className="text-[#039be5]">Assessment</span>
            </h1>
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              Complete your initial diagnostic sets. These scores will serve as your semester baseline for progress tracking.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            {!hasCompleted ? (
              <button 
                onClick={savePreTest}
                disabled={isSubmitting}
                className="group relative flex items-center gap-3 bg-[#039be5] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Sync Baseline & Lock
              </button>
            ) : (
              <button 
                onClick={() => router.push('/phase/2-weekly-logs')}
                className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
              >
                Go to Weekly Logs <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* EXERCISE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXERCISES.map((ex) => (
            <div 
              key={ex.id} 
              className={`bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden group ${hasCompleted ? 'opacity-90' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-900 uppercase italic tracking-tight group-hover:text-[#039be5] transition-colors leading-tight">
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target: {ex.goal || 'Max Effort'}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{ex.sets} Sets</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl ${hasCompleted ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                  {hasCompleted ? <Lock size={20} /> : <Dumbbell size={20} />}
                </div>
              </div>

              {/* SET INPUTS */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex flex-col gap-2">
                    <label className="text-[8px] font-black text-gray-300 uppercase tracking-tighter ml-1">Set {s}</label>
                    <input 
                      type="number" 
                      disabled={hasCompleted || isLockedOut || (ex.sets < s)}
                      value={results[`${ex.id}_set${s}`] || ""}
                      placeholder={ex.sets < s ? "—" : "0"}
                      className={`
                        w-full h-14 rounded-2xl text-center font-black text-base outline-none transition-all
                        ${ex.sets < s 
                          ? 'bg-gray-50 text-gray-200 border-transparent cursor-not-allowed' 
                          : 'bg-gray-50/50 border-2 border-transparent text-[#039be5] focus:bg-white focus:border-[#039be5] focus:ring-4 focus:ring-blue-50'}
                        ${hasCompleted ? 'bg-gray-50/30 text-gray-400' : ''}
                      `}
                      onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* CARD FOOTER */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Mean Baseline</span>
                  <span className="text-xl font-black text-gray-900 tracking-tighter mt-1">
                    {calculateMean(ex.id)} <span className="text-[10px] text-gray-400">{ex.unit || 'Reps'}</span>
                  </span>
                </div>
                {results[`${ex.id}_set1`] ? (
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded-full">
                    <Clock size={16} className="text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc !important; }
        input::-webkit-outer-spin-button, 
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </Layout>
  );
              }
