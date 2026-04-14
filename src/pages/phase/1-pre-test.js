import { useState } from 'react';
import { EXERCISES } from '../../constants/exercises';
import ExerciseCard from '../../components/dashboard/ExerciseCard';
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
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6 text-[#051e34]">Phase 1: Pre-Test Diagnostic</h1>
      
      {EXERCISES.map(ex => (
        <ExerciseCard key={ex.id} exercise={ex} onUpdate={handleUpdate} />
      ))}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button 
          onClick={savePreTest}
          disabled={isSubmitting}
          className="btn-primary w-full max-w-2xl mx-auto block"
        >
          {isSubmitting ? "Uploading to Database..." : "Submit All Scores"}
        </button>
      </div>
    </div>
  );
}
