import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ClassRecord() {
  const router = useRouter();
  const { section } = router.query;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    if (router.isReady && section) {
      countEnrolledStudents();
    }
  }, [router.isReady, section]);

  const countEnrolledStudents = async () => {
    setLoading(true);
    try {
      const sectionKey = String(section).trim();
      setDebugInfo(`Querying 'profiles' table for section_code: "${sectionKey}"...`);

      // STEP 1: Just find the students
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, section_code')
        .eq('section_code', sectionKey);

      if (error) throw error;

      setStudents(data || []);
      setDebugInfo(`Query complete. Found ${data?.length || 0} students.`);
      
    } catch (err) {
      console.error("Enrollment Error:", err);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="mb-8 p-3 bg-white rounded-xl shadow-sm">
          <ArrowLeft size={20} />
        </button>

        <div className="bg-white rounded-[40px] p-12 shadow-xl border border-gray-100">
          <h1 className="text-4xl font-black text-[#001529] uppercase italic">
            SECTION <span className="text-[#FF6B00]">{section}</span>
          </h1>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-sm">
                <Loader2 className="animate-spin" size={20} />
                Scanning Database...
              </div>
            ) : (
              <div>
                <p className="text-5xl font-black text-[#001529]">
                  {students.length}
                </p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Operatives Enrolled
                </p>
              </div>
            )}
          </div>

          {/* DEBUG LOG - Useful to see what's happening */}
          <div className="mt-10 p-4 bg-black rounded-lg">
            <p className="text-[10px] font-mono text-green-400">
              {`> ${debugInfo}`}
            </p>
          </div>

          {students.length > 0 && (
            <ul className="mt-8 divide-y divide-gray-100">
              {students.map(s => (
                <li key={s.id} className="py-4 text-sm font-bold text-slate-600 uppercase">
                  {s.full_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
