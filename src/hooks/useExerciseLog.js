import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useExerciseLog(practicumId, studentId) {
  const [logData, setLogData] = useState({});
  const [loading, setLoading] = useState(true);

  // 1. Load existing data when the page opens
  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('student_id', studentId)
        .eq('practicum_type', practicumId);

      if (data) {
        // Transform array to object { ex1: { set1: 10, ... } }
        const formatted = data.reduce((acc, row) => {
          acc[row.exercise_id] = { set1: row.set_1_val, set2: row.set_2_val, set3: row.set_3_val };
          return acc;
        }, {});
        setLogData(formatted);
      }
      setLoading(false);
    }
    fetchData();
  }, [practicumId, studentId]);

  // 2. Save all changes at once
  const saveLogs = async () => {
    const rowsToUpsert = Object.entries(logData).map(([exId, sets]) => ({
      student_id: studentId,
      exercise_id: exId,
      practicum_type: practicumId,
      set_1_val: parseFloat(sets.set1 || 0),
      set_2_val: parseFloat(sets.set2 || 0),
      set_3_val: parseFloat(sets.set3 || 0),
      updated_at: new Date(),
    }));

    const { error } = await supabase
      .from('exercise_logs')
      .upsert(rowsToUpsert, { onConflict: 'student_id, exercise_id, practicum_type' });

    if (error) alert("Error saving: " + error.message);
    else alert("Progress saved successfully!");
  };

  return { logData, setLogData, saveLogs, loading };
}
