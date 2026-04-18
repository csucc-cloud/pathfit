import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import RoleGuard from '../../components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Search, 
  Loader2, 
  ShieldAlert, 
  GraduationCap, 
  Fingerprint,
  Sparkles,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

// Animation variants for the grid and cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    x: 50,
    transition: { duration: 0.3 } 
  }
};

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
        .eq('Role', 'student') 
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

  const handleAction = async (studentId, newStatus) => {
    setProcessingId(studentId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', studentId);

      if (error) throw error;
      // Framer motion will handle the exit animation automatically due to AnimatePresence
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
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
      <div className="min-h-screen pt-28 pb-20 px-6 md:px-10 lg:pl-12 max-w-[1600px] mx-auto overflow-hidden">
        
        {/* --- INTENSE HEADER SECTION --- */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 bg-fbNavy p-12 rounded-[50px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-fbOrange opacity-10 blur-[100px] -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <ShieldAlert className="text-fbOrange w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Auth Protocol 04</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
              Security <span className="text-fbOrange">Clearance</span>
            </h1>
            <div className="flex items-center gap-3 mt-6 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
              <div className={`h-2 w-2 rounded-full ${loading ? 'bg-slate-500' : 'bg-green-500 animate-pulse'}`} />
              <p className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">
                {pendingStudents.length} Students Awaiting Verification
              </p>
            </div>
          </div>

          <div className="relative group w-full lg:w-[450px] z-10">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-fbOrange transition-colors" />
            <input 
              type="text"
              placeholder="Search registry by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-20 pr-8 py-6 bg-white/5 border border-white/10 rounded-[30px] text-xs font-black text-white outline-none focus:ring-4 focus:ring-fbOrange/20 focus:bg-white/10 transition-all uppercase placeholder:text-white/20"
            />
          </div>
        </motion.header>

        {/* --- DATA STATE --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Loader2 className="text-fbNavy" size={64} />
            </motion.div>
            <p className="font-black uppercase italic tracking-[0.4em] text-fbNavy text-sm">Scanning Encrypted Registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[70px] border-4 border-dashed border-slate-100"
          >
            <div className="p-10 bg-slate-50 rounded-[45px] mb-8 relative">
              <ShieldCheck size={80} className="text-slate-100" />
              <motion.div 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles size={40} className="text-fbOrange/30" />
              </motion.div>
            </div>
            <h3 className="font-black text-fbNavy uppercase italic text-3xl tracking-tighter">Gateway Secured</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-4">All pending credentials have been processed</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
          >
            <AnimatePresence mode='popLayout'>
              {filtered.map((student) => (
                <motion.div 
                  layout
                  key={student.id}
                  variants={cardVariants}
                  exit="exit"
                  whileHover={{ y: -10 }}
                  className="bg-white p-10 rounded-[60px] border border-slate-100 shadow-xl shadow-fbNavy/5 group relative overflow-hidden flex flex-col justify-between min-h-[500px]"
                >
                  {/* ID TAG */}
                  <div className="absolute top-10 right-10 z-20">
                    <div className="bg-fbNavy text-white px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest shadow-lg">
                      #{student.student_id || 'UNKNOWN'}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-10">
                      <motion.div 
                        whileHover={{ rotate: 15 }}
                        className="shrink-0 w-20 h-20 rounded-[28px] bg-gradient-to-br from-fbNavy to-blue-900 text-white flex items-center justify-center text-3xl font-black italic shadow-2xl group-hover:from-fbOrange group-hover:to-orange-600 transition-all"
                      >
                        {student.full_name?.charAt(0)}
                      </motion.div>
                      <div className="pr-12">
                        <h4 className="font-black text-fbNavy uppercase italic text-2xl tracking-tighter leading-tight break-words">
                          {student.full_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-3 text-fbOrange font-black text-[10px] uppercase tracking-widest">
                          <GraduationCap size={14} /> {student.course}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 mb-10 bg-slate-50 p-8 rounded-[40px] border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Fingerprint size={40} className="text-fbNavy" />
                      </div>
                      
                      <DataRow label="Assigned Unit" value={student.section_code} />
                      <DataRow label="Registry Date" value={new Date(student.created_at).toLocaleDateString()} />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
                        <span className="flex items-center gap-2 text-fbOrange animate-pulse">
                          <Clock size={14} />
                          <span className="text-[11px] font-black uppercase">Pending Review</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION ZONE */}
                  <div className="flex gap-4 relative z-10">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      disabled={processingId === student.id}
                      onClick={() => handleAction(student.id, 'active')}
                      className="flex-1 py-6 bg-fbNavy text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-green-600 transition-all shadow-xl shadow-fbNavy/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {processingId === student.id ? <Loader2 className="animate-spin w-5 h-5" /> : <UserPlus size={20} />}
                      Authorize
                    </motion.button>
                    
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      disabled={processingId === student.id}
                      onClick={() => handleAction(student.id, 'rejected')}
                      className="w-20 h-20 bg-slate-100 text-slate-400 rounded-[28px] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200"
                    >
                      <XCircle size={24} />
                    </motion.button>
                  </div>

                  {/* Aesthetic Background Detail */}
                  <div className="absolute -left-10 -bottom-10 text-slate-50 font-black text-8xl italic select-none pointer-events-none group-hover:text-fbOrange/5 transition-colors">
                    STUDENT
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </RoleGuard>
  );
}

// Helper component for cleaner rows
function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      <span className="text-xs font-black text-fbNavy uppercase italic">{value}</span>
    </div>
  );
}
