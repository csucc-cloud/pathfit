// src/hooks/useExerciseLog.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useExerciseLog(practicumId, studentId) {
  const [logData, setLogData] = useState({});
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({ is_submitted: false }); // Track lock status

  // NEW: Helper to convert string IDs ('pre', 'post') to integers for the DB
  const getNumericPracticumId = (id) => {
    if (id === 'pre') return 0;
    if (id === 'post') return 9; // Changed to 9 for chronological comparison
    const parsed = parseInt(id);
    return isNaN(parsed) ? id : parsed;
  };

  const dbPracticumId = getNumericPracticumId(practicumId);

  // 1. Load existing data when the page opens
  useEffect(() => {
    async function fetchData() {
      // Guard: Ensure both IDs and supabase client exist before fetching
      if (!studentId || !practicumId || !supabase) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('student_id', studentId)
        .eq('practicum_type', dbPracticumId); // Use numeric ID here

      if (data && data.length > 0) {
        // Transform array to object { ex1: { set1: 10, ... } }
        const formatted = data.reduce((acc, row) => {
          acc[row.exercise_id] = { 
            set1: row.set_1_val, 
            set2: row.set_2_val, 
            set3: row.set_3_val 
          };
          return acc;
        }, {});
        setLogData(formatted);
        
        // Update metadata based on the first record (since all rows for this module share status)
        setMetadata({ is_submitted: data[0].is_submitted || false });
      }
      
      if (error) {
        console.error("Error fetching logs:", error.message);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [practicumId, studentId, dbPracticumId]);

  // 2. Save all changes at once
  // Enhanced to handle final submission and pass through profile-specific columns
  const saveLogs = async ({ 
    submitted = false, 
    log_type = 'workout', 
    test_name = null, 
    week_number = null, 
    locked_at = null 
  } = {}) => {
    if (!supabase) {
      alert("Database connection not initialized.");
      return;
    }

    // Protection: Block saving if already submitted
    if (metadata.is_submitted) {
      alert("This record is locked and cannot be edited.");
      return;
    }

    const rowsToUpsert = Object.entries(logData).map(([exId, sets]) => ({
      student_id: studentId,
      exercise_id: exId,
      practicum_type: dbPracticumId, // Use numeric ID for DB compatibility
      set_1_val: parseFloat(sets.set1 || 0),
      set_2_val: parseFloat(sets.set2 || 0),
      set_3_val: parseFloat(sets.set3 || 0),
      is_submitted: submitted, // Feature: Mark as final
      // CONSOLIDATED MAPPINGS:
      log_type: log_type,
      test_name: test_name,
      week_number: week_number,
      locked_at: locked_at,
      updated_at: new Date(),
    }));

    if (rowsToUpsert.length === 0) {
      alert("No changes to save.");
      return;
    }

    const { error } = await supabase
      .from('exercise_logs')
      .upsert(rowsToUpsert, { onConflict: 'student_id, exercise_id, practicum_type' });

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      // Update local metadata state if we just submitted
      if (submitted) setMetadata({ is_submitted: true });
      
      alert(submitted ? "Final record submitted and locked!" : "Progress saved successfully!");
    }
  };

  return { logData, setLogData, saveLogs, loading, metadata };
}
