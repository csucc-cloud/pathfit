// src/hooks/useAdminData.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAdminData(practicumId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllLogs() {
      if (!supabase) return;
      setLoading(true);
      
      // Fetch logs and join with profile/auth data if available
      // Using your specific column naming convention
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

      if (error) {
        console.error("Supabase Error:", error.message);
      }

      if (data) {
        // Group data by student_id for the table rows
        const grouped = data.reduce((acc, row) => {
          if (!acc[row.student_id]) {
            acc[row.student_id] = { 
              id: row.student_id, 
              exercises: 0 
            };
          }
          
          // Increment the exercise count for this student
          acc[row.student_id].exercises += 1;
          
          // Update lastActive to the most recent updated_at timestamp
          const currentRowDate = new Date(row.updated_at);
          const existingDate = acc[row.student_id].lastActive ? new Date(acc[row.student_id].lastActive) : null;
          
          if (!existingDate || currentRowDate > existingDate) {
            acc[row.student_id].lastActive = row.updated_at;
          }
          
          return acc;
        }, {});

        setStudents(Object.values(grouped));
      }
      setLoading(false);
    }

    if (practicumId) {
      fetchAllLogs();
    }
  }, [practicumId]);

  return { students, loading };
}
