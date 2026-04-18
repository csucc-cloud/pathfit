// src/pages/admin/approvals.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Search, 
  Loader2, 
  ShieldAlert, 
  GraduationCap, 
  Clock, 
  Filter,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';

export default function ApprovalsPage() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .eq('Role', 'student') // Match your case-sensitive 'Role' column
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingStudents(data || []);
    } catch (err) {
      console.error("Error fetching pending accounts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // --- DATABASE COMMUNICATION HANDLER ---
  const handleAction = async (studentId, newStatus) => {
    setProcessingId(studentId);
    try {
      // Updates the 'status' column in your 'profiles' table
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', studentId);

      if (error) throw error;
      
      // Smoothly remove from UI list after successful DB update
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      
      // Feedback for the Instructor
      console.log(`User ${studentId} status updated to: ${newStatus}`);
    } catch (err) {
      alert("Database Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = pendingStudents.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id?.includes(searchTerm)
  );

  return (
    <RoleGuard allowedRole="instructor">
      <div className="min-h-screen pt-28 pb-20 px-6 md:px-10 lg:pl-12 max-w-[1600px] mx-auto animate-entrance">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-fbOrange/10 rounded-lg">
                <ShieldAlert className="text-fbOrange w-5 h-5" />
              </div>
              <span className="text-[11px] font-black text-fbOrange uppercase tracking-[0.4em]">Security Gateway</span>
            </div>
            <h1 className="text-5xl font-black text-fbNavy uppercase italic tracking-tighter leading-none">
              Account <span className="text-fbOrange">Approvals</span>
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <div className={`h-2.5 w-2.5 rounded-full ${loading ? 'bg-slate-200' : 'bg-fbOrange animate-pulse'}`} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {pendingStudents.length} Practitioner(s) awaiting clearance
              </p>
            </div>
          </div>

          <div className="relative group w-full lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-fbOrange transition-colors" />
            <input 
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-black text-fbNavy outline-none focus:ring-8 focus:ring-fbNavy/5 focus:bg-white transition-all shadow-inner uppercase"
            />
          </div>
        </header>

        {/* DATA STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-fbNavy mb-4" size={48} />
            <p className="font-black uppercase italic tracking-[0.3em] text-fbNavy">Scanning Registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[60px] border-2 border-dashed border-slate-100">
            <div className="p-8 bg-slate-50 rounded-[35px] mb-6">
              <UserCheck size={56} className="text-slate-200" />
            </div>
            <h3 className="font-black text-fbNavy uppercase italic text-2xl tracking-tighter">Queue Clear</h3>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.25em] mt-3">All practitioners have been processed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((student) => (
              <div key={student.id} className="bg-white p-8 rounded-[48px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between">
                {/* ID Tag */}
                <div className="absolute top-6 right-8">
                  <div className="bg-fbNavy/5 px-4 py-2 rounded-2xl border border-fbNavy/5">
                    <span className="text-[10px] font-black text-fbNavy tracking-widest uppercase">#{student.student_id || 'NO-ID'}</span>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-fbNavy text-white flex items-center justify-center text-2xl font-black italic shadow-xl shadow-fbNavy/20 group-hover:bg-fbOrange transition-colors">
                      {student.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-fbNavy uppercase italic text-lg tracking-tight leading-tight">
                        {student.full_name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                         <GraduationCap size={12} className="text-fbOrange" /> {student.course}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Target Unit</span>
                      <span className="text-[11px] font-black text-fbNavy uppercase italic">{student.section_code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sign-up Date</span>
                      <span className="text-[11px] font-black text-fbNavy uppercase italic">{new Date(student.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Access Key</span>
                      <div className="flex items-center gap-1 text-fbOrange">
                        <Fingerprint size={12} />
                        <span className="text-[10px] font-black uppercase">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-4 relative z-10">
                  <button 
                    disabled={processingId === student.id}
                    onClick={() => handleAction(student.id, 'active')}
                    className="flex-1 py-4 bg-fbNavy text-white rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-fbNavy/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    {processingId === student.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle size={18} />}
                    Grant Access
                  </button>
                  <button 
                    disabled={processingId === student.id}
                    onClick={() => handleAction(student.id, 'rejected')}
                    className="w-14 h-14 bg-slate-100 text-slate-400 rounded-[22px] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200 active:scale-95"
                  >
                    <XCircle size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
