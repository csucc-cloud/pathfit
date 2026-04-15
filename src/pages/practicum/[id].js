// src/pages/practicum/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ExerciseCard from '../../components/ExerciseCard';
import { PATHFIT_EXERCISES } from '../../constants/exercises';
import { useExerciseLog } from '../../hooks/useExerciseLog';
import { supabase } from '../../lib/supabaseClient';

export default function PracticumLog() {
  const router = useRouter();
  const { id } = router.query; // Capture '1' or '2' from URL
  const [user, setUser] = useState(null);

  // 1. Check for authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // Redirect if not logged in
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  // 2. Initialize the Hook with the current Practicum ID
  const { logData, setLogData, saveLogs, loading } = useExerciseLog(id, user?.id);

  // 3. Logic to calculate how many cards are "touched" or completed
  const completedCount = Object.keys(logData).length;

  // 4. Update local state when a user types in a card
  const handleInputChange = (exId, setKey, value) => {
    setLogData((prev) => ({
      ...prev,
      [exId]: {
        ...prev[exId],
        [setKey]: value,
      },
    }));
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fbOrange"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="p-4 md:p-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <nav className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              University Fitness Curriculum • Semester 1
            </nav>
            <h2 className="text-3xl font-extrabold text-fbNavy">
              Exercise Log: Practicum {id}
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-sm text-gray-500 font-medium">Progress</p>
              <div className="w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-fbOrange h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,124,0,0.5)]"
                  style={{ width: `${(completedCount / 15) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-fbOrange uppercase">
                {completedCount} / 15 DONE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveLogs}
              className="bg-fbOrange hover:bg-fbOrange/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-fbOrange/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <span>💾</span> Save Changes
            </button>
          </div>
        </header>

        {/* Dynamic Exercise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {PATHFIT_EXERCISES.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              values={logData[ex.id]} // Pass existing values from Supabase
              onChange={handleInputChange} // Pass the change handler
            />
          ))}
        </div>
      </main>
    </Layout>
  );
}
