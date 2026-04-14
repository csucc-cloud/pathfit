import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { EXERCISES } from '../../constants/exercises';
import Layout from '../../components/ui/Layout';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, 
  RefreshCw, 
  Dumbbell, 
  ClipboardCheck, 
  Lock, 
  Clock, 
  AlertCircle 
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

    // 1. Check if Phase 1 is already completed
    const { data: existingLogs } = await supabase
      .from('performance_logs')
      .select('created_at')
      .eq('student_id', user.id)
      .eq('phase', 1);

    if (existingLogs && existingLogs.length > 0) {
      setHasCompleted(true);
      setLoadingStatus(false);
      // Auto-transition to Phase 2
      setTimeout(() => router.push('/phase/2-weekly-logs'), 2000);
      return;
    }

    // 2. Deadline Logic: Account Age vs (1 Week + 3 Days = 10 Days)
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

  // --- UI FOR EXPIRED DEADLINE ---
  if (isLockedOut && !hasCompleted) {
    return (
      <Layout title="Phase 1: Expired">
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#fee2e2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Clock size={40} color="#dc2626" />
          </div>
          <h1 style={{ color: '#051e34', fontWeight: '900', fontSize: '24px', textTransform: 'uppercase' }}>Submission Window Closed</h1>
          <p style={{ color: '#6b7280', marginTop: '16px', maxWidth: '300px', margin: '16px auto', fontWeight: '500' }}>
            The deadline (1 week and 3 days) has passed. You failed to complete the pre-test on time.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', padding: '12px 20px', borderRadius: '12px', color: '#374151', fontSize: '12px', fontWeight: 'bold' }}>
            <AlertCircle size={16} /> NO ACCESS TO PHASE 1
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      {/* 1. BRANDED NAVY HEADER */}
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

      {/* 2. INTERACTIVE PERFORMANCE TABLE */}
      <div style={{ marginTop: '-30px', position: 'relative', zIndex: 10, opacity: hasCompleted ? 0.7 : 1 }}>
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
          
          <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="text-[#039be5]" size={20} />
              <span className="font-black text-[#051e34] uppercase text-xs tracking-widest">Exercise List</span>
            </div>
            {hasCompleted && <div className="flex items-center gap-1 text-green-600 font-black text-[10px]"><Lock size={12}/> READ ONLY</div>}
          </div>

          <div className="divide-y divide-gray-50">
            {EXERCISES.map((ex) => (
              <div key={ex.id} className="p-6 hover:bg-blue-50/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-2xl text-[#051e34]">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#051e34] leading-none mb-1 uppercase text-sm">{ex.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{ex.category || 'Strength'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((setNum) => (
                      <div key={setNum} className="flex-1 md:flex-none">
                        <label className="block text-[9px] font-black text-gray-400 text-center mb-1 uppercase">Set {setNum}</label>
                        <input 
                          type="number"
                          placeholder="0"
                          disabled={hasCompleted}
                          className={`w-full md:w-20 p-3 rounded-xl text-center font-black outline-none transition-all ${hasCompleted ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-gray-50 border-2 border-gray-100 text-[#039be5] focus:border-[#039be5]'}`}
                          onChange={(e) => handleUpdate(ex.id, setNum, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FLOATING ACTION FOOTER */}
      {!hasCompleted && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f4f7f9] via-[#f4f7f9]/90 to-transparent z-50">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={savePreTest}
              disabled={isSubmitting}
              style={{
                 background: '#039be5',
                 color: 'white',
                 width: '100%',
                 padding: '20px',
                 borderRadius: '1.5rem',
                 fontWeight: '900',
                 textTransform: 'uppercase',
                 letterSpacing: '2px',
                 fontSize: '12px',
                 border: 'none',
                 borderBottom: '5px solid #01579b',
                 boxShadow: '0 20px 40px rgba(3, 155, 229, 0.3)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '12px'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Syncing and Locking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Finalize Baseline (No Redo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { background-color: #f4f7f9 !important; }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </Layout>
  );
}
