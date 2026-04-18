import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { PATHFIT_EXERCISES } from '../../../constants/exercises'; 
import { 
  ArrowLeft, Activity, Loader2, ChevronDown 
} from 'lucide-react';

export default function ClassRecord() {
  const router = useRouter();
  const { section } = router.query;

  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState('Pre-Test');
  const [students, setStudents] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);

  const activities = [
    'Pre-Test', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 
    'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Post-test'
  ];

  useEffect(() => {
    // router.isReady ensures 'section' is actually available from the URL
    if (router.isReady && section) {
      fetchData();
    }
  }, [router.isReady, section, selectedActivity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sectionKey = String(section).trim();
      console.log("Fetching data for Section:", sectionKey);

      // 1. Get the students first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, student_id_number')
        .eq('section_code', sectionKey);

      if (profileError) throw profileError;
      
      // Update students state immediately
      const foundStudents = profileData || [];
      setStudents(foundStudents);
      console.log(`Found ${foundStudents.length} students.`);

      if (foundStudents.length > 0) {
        // 2. Get the IDs of the students found
        const studentIds = foundStudents.map(s => s.id);

        // 3. Fetch logs linked to these specific student IDs
        let logQuery = supabase
          .from('exercise_logs')
          .select('*')
          .in('student_id', studentIds);

        // Apply filters based on the selected Protocol
        if (selectedActivity === 'Pre-Test' || selectedActivity === 'Post-test') {
          logQuery = logQuery.eq('test_name', selectedActivity);
        } else {
          const weekNum = parseInt(selectedActivity.split(' ')[1]);
          if (!isNaN(weekNum)) {
            logQuery = logQuery.eq('week_number', weekNum);
          }
        }

        const { data: logData, error: logError } = await logQuery;
        if (logError) throw logError;
        
        setExerciseLogs(logData || []);
        console.log(`Found ${logData?.length || 0} exercise logs.`);
      } else {
        setExerciseLogs([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvgScore = (profileId, exercise) => {
    // Filter logs for this specific student and this specific exercise ID (e.g., 'ex1')
    const logs = exerciseLogs.filter(
      l => l.student_id === profileId && l.exercise_id === exercise.id
    );
    
    if (logs.length === 0) return 0;
    
    const expectedSets = exercise.sets || 3;
    const totalSetSum = logs.reduce((acc, curr) => {
      const setSum = (curr.set_1_val || 0) + (curr.set_2_val || 0) + (expectedSets === 3 ? (curr.set_3_val || 0) : 0);
      return acc + setSum;
    }, 0);
    
    return (totalSetSum / (logs.length * expectedSets));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white rounded-3xl shadow-sm hover:bg-[#001529] hover:text-white transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#001529] uppercase italic leading-none">
              SECTION <span className="text-[#FF6B00]">{section}</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
               {students.length} Operatives Enrolled
            </p>
          </div>
        </div>

        <div className="relative">
          <select 
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="appearance-none bg-white text-[#001529] px-8 py-5 rounded-[24px] font-black text-[12px] uppercase border border-gray-100 shadow-xl min-w-[280px] outline-none"
          >
            {activities.map(act => <option key={act} value={act}>{act}</option>)}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#001529] pointer-events-none" size={18} />
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto">
        <section className="bg-white rounded-[50px] shadow-2xl border border-white overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center gap-4">
             <Activity className="text-[#FF6B00]" size={28} />
             <h2 className="font-black text-[#001529] uppercase italic text-xl">{selectedActivity} Mean Scores</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-8 text-[11px] font-black uppercase text-[#001529] sticky left-0 bg-slate-50 border-r">Operative Name</th>
                  {PATHFIT_EXERCISES.map((ex) => (
                    <th key={ex.id} className="p-4 text-[9px] font-black uppercase text-center text-gray-400">{ex.name}</th>
                  ))}
                  <th className="p-6 text-[11px] font-black uppercase text-center bg-[#001529] text-white">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={PATHFIT_EXERCISES.length + 2} className="p-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-[#FF6B00]" size={32} />
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map(s => {
                    let rowTotal = 0;
                    const scores = PATHFIT_EXERCISES.map(ex => {
                      const avg = getAvgScore(s.id, ex);
                      rowTotal += avg;
                      return avg;
                    });

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-8 sticky left-0 bg-white font-black text-xs text-[#001529] border-r uppercase">{s.full_name}</td>
                        {scores.map((score, i) => (
                          <td key={i} className="p-4 text-center text-xs font-bold text-slate-500">
                            {score > 0 ? score.toFixed(1) : '-'}
                          </td>
                        ))}
                        <td className="p-6 text-center text-sm font-black text-[#001529] bg-slate-50/50">{rowTotal.toFixed(1)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={PATHFIT_EXERCISES.length + 2} className="p-20 text-center text-gray-400 font-bold uppercase text-xs">
                      No Operatives found in this section
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
