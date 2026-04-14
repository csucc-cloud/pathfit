import { useState } from 'react';
import { EXERCISES } from '../../constants/exercises';
import ExerciseCard from '../../components/dashboard/ExerciseCard';
import Layout from '../../components/ui/Layout'; 
import { supabase } from '../../lib/supabaseClient';
import { CheckCircle2, CloudSync, Target } from 'lucide-react';

export default function PreTest() {
  const [results, setResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = (id, setNum, value) => {
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
    } else {
      alert("Phase 1 Pre-Test Saved Successfully!");
    }
    setIsSubmitting(false);
  };

  return (
    <Layout title="Phase 1: Pre-Test Diagnostic">
      {/* BRANDED HEADER SECTION */}
      <div style={{ 
        background: 'linear-gradient(135deg, #051e34 0%, #0a2e4d 100%)',
        margin: '-24px -24px 30px -24px', // Counteracting Layout padding
        padding: '40px 24px',
        borderBottom: '4px solid #039be5',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Wave Effect */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, #039be5 0%, transparent 70%)',
          opacity: 0.2,
          filter: 'blur(40px)'
        }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-[#039be5] text-white p-2 rounded-lg font-black italic text-sm">P</div>
             <span className="text-[10px] font-black text-[#039be5] tracking-[0.3em] uppercase">Phase 1 Diagnostic</span>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">Baseline Assessment</h1>
          <p className="text-white/50 text-xs font-medium mt-2 max-w-xs uppercase tracking-widest leading-relaxed">
            Establish your institutional baseline scores for the current semester.
          </p>
        </div>
      </div>

      {/* INFORMATIONAL HINT - PRO STYLE */}
      <div className="mb-8 p-5 bg-white border-l-4 border-[#039be5] rounded-r-2xl shadow-sm flex items-start gap-4">
        <div className="bg-[#039be5]/10 p-2 rounded-xl">
          <Target className="text-[#039be5]" size={20} />
        </div>
        <div>
          <p className="text-xs font-black text-[#051e34] uppercase tracking-tighter">Instructor's Note</p>
          <p className="text-sm text-gray-500 font-medium">Perform each exercise with maximum effort to ensure accurate progress tracking.</p>
        </div>
      </div>

      {/* EXERCISE LIST */}
      <div className="space-y-6 pb-40">
        {EXERCISES.map(ex => (
          <div key={ex.id} className="animate-in">
            <ExerciseCard exercise={ex} onUpdate={handleUpdate} />
          </div>
        ))}
      </div>

      {/* FLOATING ACTION BUTTON - THE LOGIN PAGE STYLE */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f4f7f9] via-[#f4f7f9]/90 to-transparent">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={savePreTest}
            disabled={isSubmitting}
            className="w-full bg-[#039be5] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-[#0288d1] active:scale-[0.98] transition-all shadow-2xl shadow-[#039be5]/40 border-b-4 border-[#01579b] flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <CloudSync className="animate-spin" size={18} />
                <span>Syncing to Cloud...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Complete Pre-Test Diagnostic</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Internal CSS for the Brand Animation */}
      <style jsx>{`
        .animate-in {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}
