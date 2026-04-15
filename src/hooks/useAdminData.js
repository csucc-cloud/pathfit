import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAdminData(practicumId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllLogs() {
      setLoading(true);
      // Fetch logs and join with profile/auth data if available
      const { data, error } = await supabase
        .from('exercise_logs')
        .select(`
          student_id,
          exercise_id,
          set_1_val,
          set_2_val,
          set_3_val,
          updated_at
        `)
        .eq('practicum_type', practicumId);

      if (data) {
        // Group data by student_id for the table rows
        const grouped = data.reduce((acc, row) => {
          if (!acc[row.student_id]) acc[row.student_id] = { id: row.student_id, exercises: 0 };
          acc[row.student_id].exercises += 1;
          acc[row.student_id].lastActive = row.updated_at;
          return acc;
        }, {});
        setStudents(Object.values(grouped));
      }
      setLoading(false);
    }
    fetchAllLogs();
  }, [practicumId]);

  return { students, loading };
}
