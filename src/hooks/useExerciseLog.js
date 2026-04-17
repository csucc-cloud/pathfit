// src/hooks/useExerciseLog.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PATHFIT_EXERCISES } from '../constants/exercises';

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

  // NEW: Calorie Calculation Helper
  const calculateKcal = (met, weightKg, value, unit) => {
    if (!weightKg || !value) return 0;
    // Estimate: 1 rep = 3 seconds (0.05 mins). If unit is secs, use value directly.
    const durationMinutes = unit.includes('sec') ? value / 60 : value * 0.05;
    // Formula: (MET * 3.5 * weight) / 200 * duration
    return ((met * 3.5 * weightKg) / 200) * durationMinutes;
  };

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
  // Enhanced to handle final submission, pass through profile-specific columns, and CALCULATE CALORIES
  const saveLogs = async ({ 
    submitted = false, 
    log_type = 'workout', 
    test_name = null, 
    week_number = null, 
    locked_at = null,
    weight = 60 // Added weight to params for calorie calculation
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

    const rowsToUpsert = Object.entries(logData).map(([exId, sets]) => {
      // Find exercise to get MET value and Unit
      const exercise = PATHFIT_EXERCISES.find(e => e.id === exId);
      const totalActivity = parseFloat(sets.set1 || 0) + parseFloat(sets.set2 || 0) + parseFloat(sets.set3 || 0);
      
      // Calculate burned calories
      const calories = calculateKcal(
        exercise?.met || 4.0, 
        weight, 
        totalActivity, 
        exercise?.unit || 'reps'
      );

      return {
        student_id: studentId,
        exercise_id: exId,
        practicum_type: dbPracticumId, 
        set_1_val: parseFloat(sets.set1 || 0),
        set_2_val: parseFloat(sets.set2 || 0),
        set_3_val: parseFloat(sets.set3 || 0),
        is_submitted: submitted,
        calories_burned: parseFloat(calories.toFixed(2)), // NEW: Save calculated calories
        log_type: log_type,
        test_name: test_name,
        week_number: week_number,
        locked_at: locked_at,
        updated_at: new Date(),
      };
    });

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
      if (submitted) setMetadata({ is_submitted: true });
      alert(submitted ? "Final record submitted and locked!" : "Progress saved successfully!");
    }
  };

  return { logData, setLogData, saveLogs, loading, metadata };
}
