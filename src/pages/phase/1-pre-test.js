import { useState } from 'react';
import { EXERCISES } from '../../constants/exercises';
import ExerciseCard from '../../components/dashboard/ExerciseCard';
import Layout from '../../components/ui/Layout'; // The new App Shell
import { supabase } from '../../lib/supabaseClient';

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

    // Transform local state into Supabase rows
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
      {/* Informational Hint for Students */}
      <div className="mb-8 p-4 bg-[#039be5]/10 border border-[#039be5]/20 rounded-2xl">
        <p className="text-sm text-[#051e34] font-medium flex items-center gap-2">
          <span>🎯</span> Establish your baseline scores for the semester.
        </p>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {EXERCISES.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex} onUpdate={handleUpdate} />
        ))}
      </div>

      {/* Action Button: Fixed at bottom within the Layout's safe zone */}
      <div className="fixed bottom-[80px] left-0 right-0 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <button 
            onClick={savePreTest}
            disabled={isSubmitting}
            className="btn-primary w-full shadow-2xl flex items-center justify-center gap-2 py-5 text-lg"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">Syncing to Cloud...</span>
              </>
            ) : (
              "Complete Pre-Test"
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
