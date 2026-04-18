import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
// Updated import to use PATHFIT_EXERCISES
import { PATHFIT_EXERCISES } from '../../../constants/exercises'; 
import { 
  ArrowLeft, User, ChevronDown, Activity, 
  ClipboardCheck, Loader2, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClassRecord() {
  const router = useRouter();
  const { section } = router.query;

  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Pre-test');
  const [students, setStudents] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);

  const activities = [
    'Pre-test', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 
    'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Post-test'
  ];

  useEffect(() => {
    if (section) fetchData();
  }, [section, selectedActivity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students directly from profiles table where section_code matches
      // Your schema shows section_code is a column in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`id, student_id, full_name, avatar_url, student_id_number, section_code`)
        .eq('section_code', section);

      if (profileError) throw profileError;

      // 2. Build Query for exercise_logs based on your schema
      let logQuery = supabase.from('exercise_logs').select('*').eq('section_code', section);

      // Consolidate activity filtering: use test_name for tests, week_number for weeks
      if (selectedActivity === 'Pre-test' || selectedActivity === 'Post-test') {
        logQuery = logQuery.eq('test_name', selectedActivity.toLowerCase().replace('-', ''));
      } else {
        const weekNum = parseInt(selectedActivity.split(' ')[1]);
        logQuery = logQuery.eq('week_number', weekNum);
      }

      const { data: logData, error: logError } = await logQuery;
      if (logError) throw logError;

      // Map profiles to the student state
      setStudents(profileData || []);
      setExerciseLogs(logData || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Logic to calculate average across set_1_val, set_2_val, and set_3_val
  const getAvgScore = (studentId, exerciseName) => {
    // Dynamically determine if we divide by 2 or 3 based on constants/exercises.js
    const exerciseDef = PATHFIT_EXERCISES.find(ex => ex.name === exerciseName);
    const expectedSets = exerciseDef?.sets || 3; 

    const logs = exerciseLogs.filter(
      l => l.student_id === studentId && (l.exercise_id === exerciseName || l.test_name === exerciseName)
    );
    
    if (logs.length === 0) return 0;
    
    const totalSetSum = logs.reduce((acc, curr) => {
      // Only include set_3_val if the exercise definition expects 3 sets
      const setSum = (curr.set_1_val || 0) + (curr.set_2_val || 0) + (expectedSets === 3 ? (curr.set_3_val || 0) : 0);
      return acc + setSum;
    }, 0);
    
    // Divide by the specific number of sets defined for this exercise
    const totalSetsCount = logs.length * expectedSets;
    return (totalSetSum / totalSetsCount);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      
      {/* MATRIX CONTROLS */}
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="p-4 bg-white rounded-3xl shadow-sm hover:bg-fbNavy hover:text-white transition-all group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-fbNavy uppercase italic leading-none">
              SECTION <span className="text-fbOrange">{section}</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Active Class Record</p>
          </div>
        </div>

        <div className="relative group">
          <label className="absolute -top-3 left-4 bg-[#F8FAFC] px-2 text-[9px] font-black text-fbOrange uppercase tracking-widest z-10">
            Select Protocol
          </label>
          <select 
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="appearance-none bg-white text-fbNavy px-8 py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.1em] outline-none cursor-pointer border border-gray-100 shadow-xl shadow-fbNavy/5 min-w-[280px]"
          >
            {activities.map(act => <option key={act} value={act}>{act}</option>)}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-fbNavy pointer-events-none" size={18} />
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-16">
        
        {/* --- TABLE 1: EXERCISE PERFORMANCE MATRIX --- */}
        <section className="bg-white rounded-[50px] shadow-2xl shadow-fbNavy/5 border border-white overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-fbOrange/10 rounded-2xl"><Activity className="text-fbOrange" size={28} /></div>
               <div>
                  <h2 className="font-black text-fbNavy uppercase italic text-xl">{selectedActivity} Mean Scores</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calculated per exercise set</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-8 text-[11px] font-black uppercase text-fbNavy sticky left-0 bg-slate-50 z-20 border-r border-gray-100"> Operative Name</th>
                  {PATHFIT_EXERCISES.map((ex) => (
                    <th key={ex.id || ex.name} className="p-4 text-[9px] font-black uppercase text-center text-gray-400 min-w-[100px]">
                      {ex.name}
                    </th>
                  ))}
                  <th className="p-6 text-[11px] font-black uppercase text-center bg-fbNavy text-white">Total</th>
                  <th className="p-6 text-[11px] font-black uppercase text-center bg-fbOrange text-white">Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.length > 0 ? (
                  students.map(s => {
                    let rowTotal = 0;
                    const scores = PATHFIT_EXERCISES.map(ex => {
                      const avg = getAvgScore(s.student_id, ex.name);
                      rowTotal += avg;
                      return avg;
                    });
                    const rowAvg = (rowTotal / PATHFIT_EXERCISES.length).toFixed(1);

                    return (
                      <tr key={s.id} className="hover:bg-fbGray/10 transition-colors group">
                        <td className="p-8 sticky left-0 bg-white group-hover:bg-gray-50 font-black text-xs text-fbNavy z-10 border-r border-gray-50 italic uppercase">
                          {s.full_name || 'Unknown Student'}
                        </td>
                        {scores.map((score, i) => (
                          <td key={i} className="p-4 text-center text-xs font-bold text-slate-500">
                            {score > 0 ? score.toFixed(1) : '-'}
                          </td>
                        ))}
                        <td className="p-6 text-center text-sm font-black text-fbNavy bg-slate-50/50">{rowTotal.toFixed(1)}</td>
                        <td className="p-6 text-center text-sm font-black text-fbOrange bg-fbOrange/5">{rowAvg}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={PATHFIT_EXERCISES.length + 3} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      {loading ? 'Initializing Matrix...' : 'No Operatives found in this section'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- TABLE 2: OVERALL WEEKLY PROGRESS --- */}
        <section className="bg-white rounded-[50px] shadow-2xl shadow-fbNavy/5 border border-white overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <div className="p-3 bg-fbNavy/10 rounded-2xl"><ClipboardCheck className="text-fbNavy" size={28} /></div>
             <h2 className="font-black text-fbNavy uppercase italic text-xl">Cumulative Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-fbNavy text-white">
                <tr>
                  <th className="p-8 text-[11px] font-black uppercase text-left">Student Profile</th>
                  {activities.map(act => <th key={act} className="p-4 text-[9px] font-black uppercase text-center opacity-70">{act}</th>)}
                  <th className="p-4 text-[11px] font-black uppercase text-center bg-fbOrange/90">W1-W8 Total</th>
                  <th className="p-4 text-[11px] font-black uppercase text-center bg-fbOrange">Grand Total</th>
                  <th className="p-4 text-[11px] font-black uppercase text-center bg-fbOrange">Total Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-fbGray overflow-hidden border-2 border-white shadow-md">
                          <img src={s.avatar_url || '/api/placeholder/48/48'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-fbNavy uppercase italic">{s.full_name}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{s.student_id_number}</p>
                        </div>
                      </div>
                    </td>
                    {activities.map(act => (
                      <td key={act} className="p-4 text-center">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 border-2 border-green-500 mx-auto" />
                      </td>
                    ))}
                    <td className="p-4 text-center font-black text-fbNavy text-xs">0.0</td>
                    <td className="p-4 text-center font-black text-fbNavy text-xs">0.0</td>
                    <td className="p-4 text-center font-black text-fbOrange text-xs italic">0.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
