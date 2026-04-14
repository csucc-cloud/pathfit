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
  History
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

    // Check if Phase 1 is already completed and fetch records
    const { data: existingLogs } = await supabase
      .from('performance_logs')
      .select('*')
      .eq('student_id', user.id)
      .eq('phase', 1);

    if (existingLogs && existingLogs.length > 0) {
      setHasCompleted(true);
      // Map existing records to results state for review
      const savedResults = {};
      existingLogs.forEach(log => {
        savedResults[`${log.exercise_id}_set1`] = log.set_1;
        savedResults[`${log.exercise_id}_set2`] = log.set_2;
        savedResults[`${log.exercise_id}_set3`] = log.set_3;
      });
      setResults(savedResults);
    }

    // Deadline Logic: Account Age vs (10 Days)
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

  if (loadingStatus) return <Layout title="Loading..."><div className="p-20 text-center font-black animate-pulse text-[#039be5]">VERIFYING STATUS...</div></Layout>;

  if (isLockedOut && !hasCompleted) {
    return (
      <Layout title="Phase 1: Expired">
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#fee2e2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Clock size={40} color="#dc2626" />
          </div>
          <h1 style={{ color: '#051e34', fontWeight: '900', fontSize: '24px', textTransform: 'uppercase' }}>Submission Window Closed</h1>
          <p style={{ color: '#6b7280', marginTop: '16px', maxWidth: '300px', margin: '16px auto', fontWeight: '500' }}>The deadline has passed. You failed to complete the pre-test on time.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      {/* 1. HERO HEADER */}
      <div style={{ 
        background: hasCompleted ? 'linear-gradient(135deg, #051e34 0%, #064e3b 100%)' : 'linear-gradient(135deg, #051e34 0%, #0a2e4d 100%)',
        margin: '-24px -24px 0 -24px',
        padding: '40px 24px 60px 24px',
        borderBottom: '4px solid #039be5',
        transition: 'all 0.5s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-[#039be5] text-white p-2 rounded-lg font-black italic text-sm">P1</div>
             <span className="text-[10px] font-black text-[#039be5] tracking-[0.3em] uppercase">
               {hasCompleted ? 'Record Status: Locked' : 'Initial Baseline Diagnostic'}
             </span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Baseline Assessment</h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/40">Institutional Fitness Standard Tracking</p>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#039be5] opacity-10 blur-3xl"></div>
      </div>

      {/* 2. STRUCTURED PERFORMANCE TABLE */}
      <div style={{ marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
          
          <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasCompleted ? <History className="text-green-500" size={18}/> : <Dumbbell className="text-[#039be5]" size={18}/>}
              <span className="font-black text-[#051e34] uppercase text-xs tracking-widest">Performance Matrix</span>
            </div>
            {hasCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[9px] font-black text-green-700">
                <Lock size={10}/> REVIEW MODE
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#051e34] text-[10px] font-black text-white uppercase tracking-widest">
                  <th className="p-5">Exercises</th>
                  <th colSpan="3" className="p-5 border-l border-white/10 text-center bg-[#039be5]/10">Input Sets</th>
                  <th className="p-5 border-l border-white/10 text-center">Unit</th>
                  <th className="p-5 border-l border-white/10 text-center">Mean Score</th>
                  <th className="p-5 border-l border-white/10 text-center">Status</th>
                </tr>
                <tr className="bg-gray-50/50 text-[9px] font-bold text-gray-500 text-center uppercase">
                  <th className="border-b"></th>
                  <th className="p-2 border-b border-l w-20">Set 1</th>
                  <th className="p-2 border-b w-20">Set 2</th>
                  <th className="p-2 border-b w-20">Set 3</th>
                  <th className="p-2 border-b border-l">Metric</th>
                  <th className="p-2 border-b border-l">Avg</th>
                  <th className="p-2 border-b border-l">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {EXERCISES.map((ex) => (
                  <tr key={ex.id} className="group hover:bg-blue-50/20 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3 text-xs">
                        <Dumbbell size={14} className="text-[#039be5]" />
                        <span className="font-black text-[#051e34] uppercase italic">{ex.name}</span>
                      </div>
                    </td>
                    {[1, 2, 3].map((s) => (
                      <td key={s} className={`p-2 border-l border-gray-50 text-center ${ex.sets < s ? 'bg-gray-50/50' : ''}`}>
                        <input 
                          type="number" 
                          disabled={hasCompleted || (ex.sets < s)}
                          value={results[`${ex.id}_set${s}`] || ""}
                          placeholder={ex.sets < s ? "—" : "0"}
                          className={`w-16 p-2 rounded-lg bg-transparent text-center font-black text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#039be5]/20 ${ex.sets < s ? 'text-gray-200' : 'text-[#039be5]'}`}
                          onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="p-5 border-l border-gray-50 text-center">
                      <span className="text-[9px] font-black px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase">
                        {ex.unit || (ex.type === 'time' ? 'Time' : 'Reps')}
                      </span>
                    </td>
                    <td className="p-5 border-l border-gray-50 text-center font-black text-xs text-[#051e34]">
                      {calculateMean(ex.id)}
                    </td>
                    <td className="p-5 border-l border-gray-50 text-center">
                      <div className="flex justify-center transition-transform group-hover:scale-110">
                        {results[`${ex.id}_set1`] ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <Clock size={18} className="text-gray-200" />
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

      {/* 3. DYNAMIC ACTION FOOTER */}
      <div className="mt-10 px-4 pb-20 text-center">
        {!hasCompleted ? (
          <button 
            onClick={savePreTest}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 bg-[#039be5] text-white p-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl border-b-4 border-[#01579b] active:scale-95 transition-transform"
          >
            {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            <span>Sync Baseline and Lock</span>
          </button>
        ) : (
          <button 
            onClick={() => router.push('/phase/2-weekly-logs')}
            className="flex w-full items-center justify-center gap-3 bg-[#051e34] text-white p-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl border-b-4 border-black active:scale-95 transition-transform"
          >
            Proceed to Phase 2: Weekly Logs <ChevronRight size={20}/>
          </button>
        )}
      </div>

      <style jsx global>{`
        body { background-color: #f8fafc !important; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </Layout>
  );
}



