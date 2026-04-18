import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Using Next.js router
import { supabase } from '../../../lib/supabaseClient';
import { 
  ArrowLeft, 
  User, 
  Download,
  CheckCircle2,
  Circle,
  Loader2,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClassRecord() {
  const router = useRouter();
  const { section } = router.query; // Pulls the section ID from the URL
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  
  const milestones = [
    'Pre-test', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 
    'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Post-test'
  ];

  useEffect(() => {
    if (section) fetchRoster();
  }, [section]);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      // Fetching from your specific instructor-managed tables
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          profiles:student_id (
            full_name,
            avatar_url,
            student_id_number
          ),
          progress:student_progress (
            milestone_name,
            status
          )
        `)
        .eq('section_id', section);

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error("Access Denied:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-12 pb-20 px-6 md:px-10">
      
      {/* MATRIX HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6"
      >
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-fbNavy hover:text-white transition-all group"
          >
            <ArrowLeft size={24} className="group-active:-translate-x-2 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={14} className="text-fbOrange" />
              <span className="text-[10px] font-black text-fbOrange uppercase tracking-[0.3em]">Live Roster</span>
            </div>
            <h1 className="text-4xl font-black text-fbNavy uppercase italic leading-none">
              Section <span className="text-fbOrange">{section}</span>
            </h1>
          </div>
        </div>

        <button className="bg-fbNavy text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-fbOrange transition-all shadow-xl shadow-fbNavy/10">
          <Download size={18} /> Export Protocol
        </button>
      </motion.div>

      {/* ROSTER DATA MATRIX */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[1600px] mx-auto bg-white rounded-[45px] shadow-2xl shadow-fbNavy/5 border border-white overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-fbNavy text-white">
                <th className="p-8 text-[11px] font-black uppercase tracking-widest text-left sticky left-0 bg-fbNavy z-10">Student Identity</th>
                {milestones.map((m) => (
                  <th key={m} className="p-6 text-[10px] font-black uppercase tracking-widest text-center border-l border-white/5">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-fbOrange mb-4" size={48} />
                    <p className="text-[10px] font-black text-fbNavy uppercase tracking-[0.4em]">Syncing Student Matrix...</p>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-fbGray/20 transition-all group">
                    <td className="p-8 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[10px_0_15px_-10px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-fbGray overflow-hidden border-2 border-white shadow-md">
                          {student.profiles?.avatar_url ? (
                            <img src={student.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={24} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-fbNavy uppercase italic leading-none">{student.profiles?.full_name}</p>
                          <p className="text-[9px] font-bold text-fbOrange mt-1 uppercase tracking-widest">{student.profiles?.student_id_number}</p>
                        </div>
                      </div>
                    </td>

                    {/* Milestone Progress Mapping */}
                    {milestones.map((m) => (
                      <td key={m} className="p-6 text-center border-l border-gray-50">
                        <div className="flex justify-center">
                           {/* Replace logic here with your actual progress comparison */}
                           {Math.random() > 0.5 ? (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={20} className="text-green-500" /></motion.div>
                           ) : (
                             <Circle size={20} className="text-gray-100" />
                           )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="p-20 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No operatives found in this sector.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
