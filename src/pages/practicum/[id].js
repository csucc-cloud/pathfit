// src/pages/practicum/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ExerciseCard from '../../components/ExerciseCard';
import { PATHFIT_EXERCISES } from '../../constants/exercises';
import { useExerciseLog } from '../../hooks/useExerciseLog';
import { supabase } from '../../lib/supabaseClient';
// Importing Lucide icons for the student portal
import { 
  Dumbbell, 
  Save, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  Trophy,
  Activity
} from 'lucide-react';

export default function PracticumLog() {
  const router = useRouter();
  const { id } = router.query; // Capture '1' or '2' from URL
  const [user, setUser] = useState(null);

  // 1. Check for authenticated user
  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
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
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-fbOrange" />
          <p className="text-fbNavy font-bold animate-pulse">Syncing fitness profile...</p>
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
            <nav className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Trophy className="w-3 h-3 text-fbAmber" />
              University Fitness Curriculum • Semester 1
            </nav>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="lg:hidden p-2 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-fbNavy" />
              </button>
              <h2 className="text-3xl font-extrabold text-fbNavy flex items-center gap-3">
                <Dumbbell className="text-fbOrange w-8 h-8" />
                Exercise Log: Practicum {id}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 mt-4 bg-white/50 p-2 rounded-2xl border border-white/20 inline-flex">
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2 ml-2">
                <Activity className="w-4 h-4 text-fbOrange" />
                Progress
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-fbOrange h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,124,0,0.5)]"
                  style={{ width: `${(completedCount / 15) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-fbOrange uppercase flex items-center gap-1 pr-2">
                <CheckCircle2 className="w-3 h-3" />
                {completedCount} / 15 DONE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveLogs}
              className="bg-fbOrange hover:bg-fbOrange/90 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-fbOrange/20 transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap group"
            >
              <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Save Changes
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
