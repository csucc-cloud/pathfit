import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import PostCard from '../../components/admin/PostCard';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, FileDown, Eye, Loader2, Plus, Send, ChevronRight, 
  X, FileText, Image as ImageIcon, MessageSquare, 
  Globe, ShieldCheck, Activity, Terminal, Share2, ThumbsUp, MoreHorizontal,
  Paperclip, Clock, Calendar
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
        const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data, error } = await supabase.storage.from('announcement-attachments').upload(name, file);
        if (error) throw error;
        const { data: publicData } = supabase.storage.from('announcement-attachments').getPublicUrl(name);
        fUrl = publicData.publicUrl;
        fType = file.name.split('.').pop();
      }
      const { error: insertError } = await supabase.from('announcements').insert([{ 
        content: announcement, 
        target_section: targetSection === 'all' ? null : targetSection, 
        is_global: targetSection === 'all', 
        instructor_id: instructor.id, 
        file_url: fUrl, 
        file_type: fType 
      }]);
      if (insertError) throw insertError;
      setAnnouncement(""); 
      setFile(null); 
      fetchData();
    } catch (err) { 
        console.error(err);
        alert("Failed to post: " + err.message); 
    } finally { 
        setIsPosting(false); 
    }
  };

  return (
    <RoleGuard allowedRole="instructor">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]" /> 
      
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{visible:{transition:{staggerChildren:0.05}}}} 
        className="max-w-[1500px] mx-auto p-4 md:p-6 space-y-6 font-sans lg:h-[100dvh] flex flex-col overflow-x-hidden pt-2 lg:pt-6"
      >
        
        {/* HEADER - GLASSMORPHISM (Adjusted for top spacing) */}
        <header className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-sm border border-white/20 z-50 shrink-0 mt-4 md:mt-6 lg:mt-0">
          <div className="flex items-center gap-3 md:gap-4">
            <h1 className="text-lg md:text-xl font-black text-fbNavy tracking-tighter flex items-center gap-2">
                <div className="p-2 bg-fbNavy rounded-xl text-white shadow-lg shadow-fbNavy/20"><Terminal size={18}/></div>
                <span className="hidden xs:inline">ANNOUNCEMENT</span> <span className="text-fbOrange uppercase">PORTAL</span>
            </h1>
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[12px] font-extrabold text-slate-900 leading-none">{instructor?.full_name}</p>
                <p className="text-[9px] font-black text-fbOrange uppercase tracking-tighter">Instructor</p>
             </div>
             <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm hover:border-fbOrange transition-all cursor-pointer">
                {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="avatar"/> : <div className="w-full h-full flex items-center justify-center font-bold bg-fbNavy text-white">{instructor?.full_name?.[0]}</div>}
             </div>
          </div>
        </header>

        {/* 2 COLUMN GRID (Responsive Switch) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden min-h-0 pb-10 lg:pb-0">
          
          {/* FEED COLUMN */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col space-y-5 lg:overflow-hidden min-h-0 order-1">
            
            {/* POST COMPOSER */}
            <motion.div variants={v} className="bg-white rounded-2xl p-4 md:p-5 shadow-md border border-slate-100 shrink-0 ring-1 ring-black/[0.02]">
              <div className="flex gap-3 md:gap-4 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm hidden xs:block">
                  {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="user"/> : <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold">{instructor?.full_name?.[0]}</div>}
                </div>
                <div className="flex-1">
                    <textarea 
                        value={announcement} 
                        onChange={(e)=>setAnnouncement(e.target.value)} 
                        className="w-full p-4 bg-slate-50/50 rounded-2xl text-sm border border-transparent focus:border-fbNavy/10 focus:bg-white focus:ring-4 focus:ring-fbNavy/5 transition-all outline-none resize-none min-h-[80px]" 
                        placeholder={`What's on your mind, ${instructor?.full_name?.split(' ')[0]}?`} 
                    />
                </div>
              </div>

              {/* ATTACHMENT PREVIEW */}
              {file && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4 xs:ml-14 p-3 bg-fbOrange/5 border border-fbOrange/20 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-fbOrange rounded-lg text-white">
                            <Paperclip size={16}/>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[150px] md:max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-fbOrange font-bold uppercase tracking-tighter">Ready to upload</p>
                        </div>
                    </div>
                    <button onClick={()=>setFile(null)} className="p-1 hover:bg-fbOrange/10 rounded-full text-fbOrange transition-colors shrink-0">
                        <X size={18}/>
                    </button>
                </motion.div>
              )}

              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button onClick={()=>fileInputRef.current.click()} className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-bold transition-all border border-transparent hover:border-slate-200">
                    <ImageIcon size={18} className="text-emerald-500"/> 
                    <span className="hidden sm:inline">Attach Media</span>
                  </button>
                  <div className="w-[1px] h-4 bg-slate-200 self-center mx-1 hidden xs:block" />
                  <div className="relative group">
                    <select 
                        value={targetSection} 
                        onChange={(e)=>setTargetSection(e.target.value)} 
                        className="appearance-none bg-slate-50 hover:bg-slate-100 text-[10px] md:text-[11px] font-bold uppercase rounded-xl px-3 md:px-4 py-2 border border-slate-200 outline-none transition-all cursor-pointer pr-8"
                    >
                        <option value="all">Public (Global)</option>
                        {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none"/>
                  </div>
                </div>

                <button 
                    onClick={handlePost} 
                    disabled={isPosting || (!announcement.trim() && !file)} 
                    className={`flex items-center gap-2 px-5 md:px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg w-full sm:w-auto justify-center ${
                        isPosting || (!announcement.trim() && !file) 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-fbNavy text-white hover:bg-fbNavy/90 active:scale-95 shadow-fbNavy/20'
                    }`}
                >
                    {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
            </motion.div>

            {/* SCROLLABLE FEED */}
            <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-2 space-y-6 custom-scrollbar lg:pb-10">
              {announcements.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
                    <Activity size={48} className="mb-4 opacity-20"/>
                    <p>No announcements yet.</p>
                </div>
              )}

              {announcements.map(ann => (
                <PostCard key={ann.id} ann={ann} instructor={instructor} />
              ))}
            </div>
          </div>

          {/* SIDEBAR COLUMN - STACKS ON MOBILE */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col space-y-6 lg:overflow-hidden min-h-0 order-2">
            
            {/* SECTIONS */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 shrink-0">
              <div className="flex justify-between items-center mb-5">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic</h3>
                    <h3 className="text-sm font-black text-fbNavy">Active Sections</h3>
                </div>
                <button onClick={()=>setIsModalOpen(true)} className="p-2 bg-fbNavy/5 hover:bg-fbNavy text-fbNavy hover:text-white rounded-xl transition-all"><Plus size={18}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {sections.map(s => (
                  <div key={s.id} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 group-hover:bg-fbNavy group-hover:text-white rounded-xl flex items-center justify-center font-black text-[11px] text-fbNavy transition-all">{s.section_code[0]}</div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-fbNavy transition-colors">{s.section_code}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-fbOrange group-hover:translate-x-1 transition-all"/>
                  </div>
                ))}
              </div>
            </div>

            {/* REGISTRY - ADAPTIVE HEIGHT */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col lg:flex-1 lg:overflow-hidden min-h-[400px] lg:min-h-0">
                <div className="mb-5 shrink-0">
                    <h2 className="text-sm font-black text-fbNavy uppercase italic flex items-center gap-2">
                        <Users size={16} className="text-fbOrange"/> Student <span className="text-fbOrange">Registry</span>
                    </h2>
                </div>
                
                <div className="flex flex-col flex-1 lg:overflow-hidden space-y-4">
                    <div className="relative shrink-0">
                        <input 
                            type="text" 
                            placeholder="Find a student..." 
                            onChange={(e)=>setSearchTerm(e.target.value)} 
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold focus:bg-white focus:ring-2 focus:ring-fbNavy/10 transition-all outline-none"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    </div>
                    
                    <button onClick={handleExport} className="w-full py-3 bg-fbNavy text-white rounded-xl hover:bg-fbOrange transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fbNavy/10 active:scale-[0.98] shrink-0">
                        GENERATE REPORT (CSV)
                    </button>

                    <div className="lg:overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar min-h-0">
                        <AnimatePresence>
                        {filtered.map(s => (
                            <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={s.id} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 shrink-0 group hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-fbOrange transition-all">
                                        {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" alt="student"/> : <div className="text-[11px] font-black text-fbNavy">{s.full_name?.[0]}</div>}
                                    </div>
                                    <div className="overflow-hidden min-w-0">
                                        <h4 className="text-[11px] font-black text-slate-900 truncate uppercase leading-tight group-hover:text-fbNavy">{s.full_name}</h4>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[9px] font-black text-fbOrange tracking-tighter">{s.student_id}</p>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <p className="text-[9px] font-bold text-slate-400">{s.section_code}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

          </div>
        </div>

      </motion.div>
      <CreateSectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        @media (max-width: 1024px) {
          .custom-scrollbar { overflow-y: visible !important; }
        }
      `}</style>
    </RoleGuard>
  );
}
