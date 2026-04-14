import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EXERCISES } from '../../constants/exercises';
import Layout from '../../components/ui/Layout';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, 
  RefreshCw, 
  Dumbbell, 
  Lock, 
  Clock, 
  AlertCircle,
  ChevronRight,
  History,
  Activity,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

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
      alert("✅ Baseline Assessment Synced and Locked!");
    }
  };

  if (loadingStatus) return (
    <Layout title="Initializing...">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-[#039be5]" size={40} />
        <p className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">Synchronizing Secure Data</p>
      </div>
    </Layout>
  );

  if (isLockedOut && !hasCompleted) {
    return (
      <Layout title="Phase 1: Expired">
        <div className="max-w-md mx-auto mt-20 p-12 bg-white rounded-[3rem] shadow-2xl text-center border border-red-50">
          <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-inner">
            <Clock size={44} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-[#051e34] uppercase italic tracking-tighter">System Lockout</h1>
          <p className="text-slate-500 mt-4 font-medium">The 10-day window for baseline diagnostic submission has expired. Contact administration for manual override.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      {/* 1. BRANDED HERO SECTION */}
      <div className="relative -mx-6 -mt-6 mb-12 overflow-hidden bg-[#051e34] px-8 py-16 text-white shadow-xl lg:rounded-b-[4rem]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md border border-white/10">
              <Activity size={14} className="text-[#039be5]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Phase 01</span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase sm:text-7xl">
              Baseline <span className="text-[#039be5] block sm:inline">Assessment</span>
            </h1>
            <p className="max-w-xl text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Institutional Fitness Standards • Semestral Physical Diagnostic
            </p>
          </div>
          
          {hasCompleted && (
            <div className="flex items-center gap-4 rounded-3xl bg-green-500/10 p-4 border border-green-500/20 backdrop-blur-xl">
              <ShieldCheck className="text-green-400" size={32} />
              <div>
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Data Integrity</p>
                <p className="font-black text-white italic">SECURED & LOCKED</p>
              </div>
            </div>
          )}
        </div>
        {/* Abstract Background Element */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#039be5] opacity-20 blur-[120px]"></div>
      </div>

      {/* 2. PERFORMANCE WORKSPACE */}
      <div className="max-w-7xl mx-auto px-2 mb-40">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
          
          {/* Header/Status Bar */}
          <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl shadow-lg shadow-slate-200">
                <Dumbbell className="text-[#039be5]" size={20}/>
              </div>
              <div>
                <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest italic">Performance Matrix</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Enter raw scores for calculation</p>
              </div>
            </div>
            {hasCompleted && (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2">
                <History className="text-slate-400" size={14}/>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Read-Only Archive</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                  <th className="p-8">Exercise Discipline</th>
                  <th colSpan="3" className="p-8 text-center bg-slate-800 border-x border-white/5">Raw Data Entry (Sets)</th>
                  <th className="p-8 text-center">Metric</th>
                  <th className="p-8 text-center bg-[#039be5]">Mean</th>
                  <th className="p-8 text-center">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EXERCISES.map((ex) => (
                  <tr key={ex.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-1 shadow-sm bg-slate-200 group-hover:bg-[#039be5] transition-colors rounded-full"></div>
                        <div>
                          <span className="text-[15px] font-black text-slate-900 uppercase italic tracking-tight">{ex.name}</span>
                          <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <TrendingUp size={10}/> Growth Target
                          </div>
                        </div>
                      </div>
                    </td>
                    {[1, 2, 3].map((s) => (
                      <td key={s} className={`p-4 border-l border-slate-50 text-center ${ex.sets < s ? 'bg-slate-50/30' : ''}`}>
                        <div className="relative inline-block group/input">
                          <input 
                            type="number" 
                            disabled={hasCompleted || (ex.sets < s)}
                            value={results[`${ex.id}_set${s}`] || ""}
                            placeholder={ex.sets < s ? "—" : "0"}
                            className={`
                              w-20 h-16 rounded-2xl bg-white border-2 text-center font-black text-lg outline-none transition-all
                              ${ex.sets < s ? 'border-transparent text-slate-200 cursor-not-allowed' : 'border-slate-100 text-[#039be5] shadow-sm hover:border-[#039be5]/30 focus:border-[#039be5] focus:ring-8 focus:ring-[#039be5]/5'}
                              ${hasCompleted ? 'border-transparent' : ''}
                            `}
                            onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                          />
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-[8px] font-black text-slate-300 uppercase opacity-0 group-hover/input:opacity-100 transition-opacity">Set {s}</span>
                        </div>
                      </td>
                    ))}
                    <td className="p-8 border-l border-slate-50 text-center">
                      <span className="inline-block px-4 py-2 rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter shadow-inner">
                        {ex.unit || (ex.type === 'time' ? 'Time' : 'Reps')}
                      </span>
                    </td>
                    <td className="p-8 border-l border-slate-50 text-center bg-[#039be5]/5">
                      <span className="text-lg font-black text-slate-900 italic tracking-tighter">
                        {calculateMean(ex.id)}
                      </span>
                    </td>
                    <td className="p-8 border-l border-slate-50 text-center">
                      <div className="flex justify-center transition-transform group-hover:scale-125 duration-500">
                        {results[`${ex.id}_set1`] ? (
                          <div className="bg-green-100 p-2 rounded-full"><CheckCircle2 size={20} className="text-green-600" /></div>
                        ) : (
                          <div className="bg-slate-50 p-2 rounded-full"><Clock size={20} className="text-slate-300" /></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. HIGH-CONTRAST ACTION DOCK */}
      <div className="fixed bottom-10 left-0 right-0 z-50 px-6 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          {!hasCompleted ? (
            <button 
              onClick={savePreTest}
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center gap-4 bg-[#039be5] text-white p-8 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-[0_20px_50px_rgba(3,155,229,0.3)] hover:shadow-[0_20px_50px_rgba(3,155,229,0.5)] active:scale-[0.98] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {isSubmitting ? <RefreshCw className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
              <span>Sync Baseline & Lock Data</span>
            </button>
          ) : (
            <button 
              onClick={() => router.push('/phase/2-weekly-logs')}
              className="group w-full flex items-center justify-center gap-4 bg-slate-900 text-white p-8 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl hover:bg-black active:scale-[0.98] transition-all"
            >
              <span>Begin Weekly Training Phase</span>
              <ChevronRight className="group-hover:translate-x-2 transition-transform" size={24}/>
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #fcfdfe !important; letter-spacing: -0.01em; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </Layout>
  );
}
