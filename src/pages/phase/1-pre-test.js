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
  Calculator
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
      .select('created_at')
      .eq('student_id', user.id)
      .eq('phase', 1);

    if (existingLogs && existingLogs.length > 0) {
      setHasCompleted(true);
      setLoadingStatus(false);
      setTimeout(() => router.push('/phase/2-weekly-logs'), 2000);
      return;
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

  // Helper to calculate mean (average) for the table
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
      router.push('/phase/2-weekly-logs');
    }
  };

  if (loadingStatus) return <Layout title="Loading..."><div className="p-20 text-center font-black animate-pulse">VERIFYING STATUS...</div></Layout>;

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
      {/* HEADER */}
      <div style={{ 
        background: hasCompleted ? '#10b981' : 'linear-gradient(135deg, #051e34 0%, #0a2e4d 100%)',
        margin: '-24px -24px 0 -24px',
        padding: '40px 24px 60px 24px',
        borderBottom: '4px solid #039be5',
        transition: 'all 0.5s ease'
      }}>
        <div className="flex items-center gap-3 mb-2">
           <div className="bg-[#039be5] text-white p-2 rounded-lg font-black italic text-sm">P</div>
           <span className="text-[10px] font-black text-[#039be5] tracking-[0.3em] uppercase">
             {hasCompleted ? 'TEST COMPLETED' : 'Phase 1 Diagnostic'}
           </span>
        </div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter">
          {hasCompleted ? 'Baseline Locked' : 'Baseline Assessment'}
        </h1>
      </div>

      {/* INTERACTIVE TABLE */}
      <div style={{ marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-4 border-b">Exercises</th>
                  <th colSpan="3" className="p-4 border-b border-l text-center bg-gray-100/50 text-[#039be5]">Performance Sets</th>
                  <th className="p-4 border-b border-l text-center">Type</th>
                  <th className="p-4 border-b border-l text-center">Mean</th>
                  <th className="p-4 border-b border-l text-center">Status</th>
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
                  <tr key={ex.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Dumbbell size={14} className="text-[#039be5]" />
                        <span className="font-black text-[#051e34] text-xs uppercase">{ex.name}</span>
                      </div>
                    </td>
                    {[1, 2, 3].map((s) => (
                      <td key={s} className="p-2 border-l text-center">
                        <input 
                          type="number" 
                          disabled={hasCompleted || (ex.sets < s)}
                          placeholder={ex.sets < s ? "-" : "0"}
                          className={`w-full bg-transparent text-center font-bold text-sm outline-none ${ex.sets < s ? 'text-gray-200' : 'text-[#039be5]'}`}
                          onChange={(e) => handleUpdate(ex.id, s, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="p-4 border-l text-center">
                      <span className="text-[9px] font-black px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase">
                        {ex.unit || (ex.type === 'time' ? 'Time' : 'Reps')}
                      </span>
                    </td>
                    <td className="p-4 border-l text-center font-black text-xs text-[#051e34]">
                      {calculateMean(ex.id)}
                    </td>
                    <td className="p-4 border-l text-center">
                      <div className="flex justify-center">
                        {results[`${ex.id}_set1`] ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className={hasCompleted ? "text-gray-200" : "text-gray-300"} />
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

      {/* FOOTER ACTION */}
      {!hasCompleted && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f4f7f9] to-transparent z-50">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={savePreTest}
              disabled={isSubmitting}
              style={{
                 background: '#039be5', color: 'white', width: '100%', padding: '20px', borderRadius: '1.5rem',
                 fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px',
                 border: 'none', borderBottom: '5px solid #01579b', boxShadow: '0 20px 40px rgba(3, 155, 229, 0.3)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
              }}
            >
              {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              <span>Sync Baseline and Lock</span>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { background-color: #f4f7f9 !important; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </Layout>
  );
}
