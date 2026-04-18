import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, FileDown, Eye, Loader2, Plus, Send, ChevronRight, 
  X, FileText, Image as ImageIcon, Layers, MessageSquare, 
  Globe, ShieldCheck, Activity, Terminal, Hash
} from 'lucide-react';

const v = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]); 
  const [instructor, setInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""), [announcement, setAnnouncement] = useState(""); 
  const [targetSection, setTargetSection] = useState("all"), [sections, setSections] = useState([]); 
  const [isPosting, setIsPosting] = useState(false), [file, setFile] = useState(null), [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from('instructors').select('*').eq('id', user.id).single();
      setInstructor(prof);
      const { data: sec } = await supabase.from('sections').select('*').eq('instructor_id', user.id);
      if (sec) {
        setSections(sec);
        const codes = sec.map(s => s.section_code.trim());
        if (codes.length > 0) {
          const { data: stud } = await supabase.from('profiles').select('*').in('section_code', codes).eq('Role', 'student').eq('status', 'active');
          if (stud) setStudents(stud);
        }
      }
      const { data: ann } = await supabase.from('announcements').select('*').eq('instructor_id', user.id).order('created_at', { ascending: false });
      if (ann) setAnnouncements(ann);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = students.filter(s => s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) || s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleExport = () => downloadCSV(filtered.map(s => ({ ID: s.student_id, Name: s.full_name, Section: s.section_code })), `Student_Registry`);

  const handlePost = async () => {
    if (!announcement.trim() && !file) return;
    setIsPosting(true);
    try {
      let fUrl = null, fType = null;
      if (file) {
        const name = `${Date.now()}.${file.name.split('.').pop()}`;
        await supabase.storage.from('announcement-attachments').upload(name, file);
        fUrl = supabase.storage.from('announcement-attachments').getPublicUrl(name).publicUrl;
        fType = file.name.split('.').pop();
      }
      await supabase.from('announcements').insert([{ content: announcement, target_section: targetSection === 'all' ? null : targetSection, is_global: targetSection === 'all', instructor_id: instructor.id, file_url: fUrl, file_type: fType }]);
      setAnnouncement(""); setFile(null); fetchData();
    } catch (err) { alert(err.message); } finally { setIsPosting(false); }
  };

  return (
    <RoleGuard allowedRole="instructor">
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC]" />
      <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.05}}}} className="max-w-[1400px] mx-auto p-6 space-y-8 font-sans">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div className="p-2 bg-fbNavy rounded-lg text-white"><Terminal size={20}/></div>
              ACADEMIC <span className="text-fbOrange">PORTAL</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instructor Management Environment</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="text-right pr-3 border-r border-slate-100 hidden sm:block">
                <p className="text-[11px] font-black text-slate-900 uppercase">{instructor?.full_name}</p>
                <p className="text-[9px] font-bold text-fbOrange uppercase">Faculty Staff</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold">{instructor?.full_name?.[0]}</div>}
             </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: ANNOUNCEMENTS */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div variants={v} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-2"><MessageSquare size={16} className="text-fbOrange"/> Post Bulletin</h3>
                <select value={targetSection} onChange={(e)=>setTargetSection(e.target.value)} className="text-[10px] font-bold uppercase bg-slate-50 border-none rounded-lg px-3 py-2 outline-none">
                  <option value="all">All Sections</option>
                  {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                </select>
              </div>
              <textarea value={announcement} onChange={(e)=>setAnnouncement(e.target.value)} placeholder="Type school announcement here..." className="w-full bg-slate-50 rounded-2xl p-4 text-sm min-h-[100px] outline-none focus:ring-2 ring-fbOrange/20 transition-all resize-none"/>
              <div className="flex justify-between items-center mt-4">
                <button onClick={()=>fileInputRef.current.click()} className="text-[10px] font-bold uppercase flex items-center gap-2 text-slate-500 hover:text-fbNavy transition-colors">
                  <Paperclip size={14}/> {file ? file.name : "Attach File"}
                </button>
                <button onClick={handlePost} disabled={isPosting} className="bg-fbNavy text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-fbOrange transition-all">
                  {isPosting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Post Announcement
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
            </motion.div>

            <div className="space-y-4">
              {announcements.map(ann => (
                <motion.div key={ann.id} variants={v} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">{ann.target_section || "Global"}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                  {ann.file_url && <a href={ann.file_url} target="_blank" className="mt-3 flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-[10px] font-bold text-fbNavy hover:underline"><FileText size={14}/> View Attachment</a>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT: CONSOLE & SECTIONS */}
          <div className="lg:col-span-4 space-y-6">
            {/* CONSOLE TYPE DIAGNOSTICS */}
            <motion.div variants={v} className="bg-[#0F172A] rounded-[32px] p-6 text-emerald-400 font-mono text-[11px] shadow-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
                <Activity size={14}/> <span>SYSTEM_DIAGNOSTICS_V.2</span>
              </div>
              <div className="space-y-1 opacity-80">
                <p>&gt; STATUS: <span className="text-emerald-500">OPERATIONAL</span></p>
                <p>&gt; ACTIVE_STUDENTS: {students.length}</p>
                <p>&gt; TOTAL_SECTIONS: {sections.length}</p>
                <p>&gt; SYNC_LATENCY: 14ms</p>
                <p className="animate-pulse">&gt; _</p>
              </div>
            </motion.div>

            <motion.div variants={v} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase text-slate-900">Active Sections</h3>
                <button onClick={()=>setIsModalOpen(true)} className="p-2 bg-fbOrange text-white rounded-lg"><Plus size={16}/></button>
              </div>
              <div className="space-y-2">
                {sections.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-fbNavy rounded-lg flex items-center justify-center text-white text-[10px] font-black">{s.section_code[0]}</div>
                      <span className="text-[11px] font-black text-slate-700">{s.section_code}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-fbOrange"/>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* STUDENT REGISTRY SECTION */}
        <motion.section variants={v} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-black text-fbNavy uppercase italic">Student <span className="text-fbOrange">Registry</span></h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Official Enrollment Listing</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input type="text" placeholder="Search by name or ID..." onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 ring-fbOrange/20"/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              </div>
              <button onClick={handleExport} className="p-2.5 bg-fbNavy text-white rounded-xl hover:bg-fbOrange transition-colors shadow-lg"><FileDown size={18}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map(s => (
                <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={s.id} className="bg-slate-50 rounded-3xl p-6 border border-transparent hover:border-fbOrange/20 hover:bg-white hover:shadow-xl transition-all group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-100">
                      {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover"/> : <div className="text-lg font-black text-fbNavy">{s.full_name?.[0]}</div>}
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-slate-900 uppercase leading-none">{s.full_name}</h4>
                      <p className="text-[9px] font-bold text-fbOrange mt-1">{s.student_id}</p>
                    </div>
                    <div className="w-full flex gap-2 pt-2">
                      <div className="flex-1 bg-white py-2 rounded-lg border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-tighter">SEC: {s.section_code}</div>
                    </div>
                    <button className="w-full py-2 bg-fbNavy text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-fbOrange transition-all">
                      <Eye size={14}/> View Profile
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

      </motion.div>
      <CreateSectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
    </RoleGuard>
  );
}
