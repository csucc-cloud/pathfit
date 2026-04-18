import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Clock, 
  Filter, 
  Search,
  Zap,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function ApprovalsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingLogs();
  }, []);

  const fetchPendingLogs = async () => {
    try {
      setLoading(true);
      // Fetching exercise logs joined with student profiles
      const { data, error } = await supabase
        .from('exercise_logs')
        .select(`
          *,
          profiles:student_id (
            full_name,
            student_id_number,
            section_id
          )
        `)
        .eq('status', 'pending') // Only show unverified logs
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (logId, status) => {
    setProcessingId(logId);
    try {
      const { error } = await supabase
        .from('exercise_logs')
        .update({ status: status, verified_at: new Date() })
        .eq('id', logId);

      if (error) throw error;
      
      // Update local state to remove the processed log immediately
      setLogs(prev => prev.filter(log => log.id !== logId));
    } catch (err) {
      alert('Failed to update log status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <InstructorLayout>
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter">
            Audit <span className="text-fbOrange">Queue</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-fbOrange" /> 
            Verification required for student credits
          </p>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-300 uppercase">Pending Review</p>
            <p className="text-xl font-black text-fbNavy italic">{logs.length}</p>
          </div>
          <div className="w-10 h-10 bg-fbOrange/10 rounded-xl flex items-center justify-center text-fbOrange">
            <Zap size={20} className="fill-fbOrange" />
          </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="animate-spin text-fbNavy mb-4" size={40} />
            <p className="font-black uppercase italic tracking-tighter">Loading Submissions...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-[45px] p-20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-fbNavy uppercase italic tracking-tighter">Queue Clear</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">All student logs have been processed.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className={`bg-white p-6 md:p-8 rounded-[35px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-xl hover:translate-x-2 ${processingId === log.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* STUDENT INFO */}
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-fbGray rounded-2xl flex flex-col items-center justify-center border-b-4 border-fbOrange">
                  <span className="text-[10px] font-black text-fbNavy opacity-30 uppercase leading-none">Day</span>
                  <span className="text-2xl font-black text-fbNavy italic leading-none">{new Date(log.created_at).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-black text-fbNavy text-lg uppercase italic tracking-tight">
                    {log.profiles?.full_name || 'Unknown Student'}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    {log.profiles?.student_id_number} • <span className="text-fbOrange">{log.exercise_type}</span>
                  </p>
                </div>
              </div>

              {/* LOG DATA */}
              <div className="grid grid-cols-2 gap-8 w-full md:w-auto px-4 border-l border-gray-50">
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-sm font-black text-fbNavy italic">{log.duration_minutes} MINS</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Intensity</p>
                  <p className="text-sm font-black text-fbNavy italic">{log.intensity_level}</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleAction(log.id, 'rejected')}
                  className="flex-1 md:flex-none p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                  title="Reject Log"
                >
                  <XCircle size={22} />
                </button>
                <button 
                  onClick={() => handleAction(log.id, 'approved')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-fbNavy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95 shadow-lg shadow-fbNavy/10"
                >
                  <CheckCircle2 size={18} />
                  Approve Log
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </InstructorLayout>
  );
}
