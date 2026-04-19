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
  Paperclip, Clock, Calendar, Zap, Sparkles, Filter, BarChart3
} from 'lucide-react';

const v = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]); 
  const [instructor, setInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [announcement, setAnnouncement] = useState(""); 
  const [targetSection, setTargetSection] = useState("all");
  const [sections, setSections] = useState([]); 
  const [isPosting, setIsPosting] = useState(false);
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fbNavy/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fbOrange/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>
      
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{visible:{transition:{staggerChildren:0.05}}}} 
        className="max-w-[1600px] mx-auto p-4 md:p-6 lg:h-screen flex flex-col gap-6"
      >
        
        {/* HEADER */}
        <header className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-4 md:px-8 md:py-5 rounded-[2.5rem] shadow-sm border border-white/60 shrink-0">
          <div className="flex items-center gap-5">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-fbNavy to-fbOrange rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative p-3 bg-fbNavy rounded-xl text-white shadow-lg">
                    <Terminal size={20} className="group-hover:rotate-12 transition-transform"/>
                </div>
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-black text-fbNavy tracking-tight flex items-center gap-1">
                    EDU<span className="text-fbOrange">OS</span>
                </h1>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Operational</span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-8">
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Nodes</p>
                    <p className="text-sm font-bold text-fbNavy">{sections.length}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Entities</p>
                    <p className="text-sm font-bold text-fbNavy">{students.length}</p>
                </div>
             </div>
             <div className="h-8 w-px bg-slate-200 hidden sm:block" />
             <div className="flex items-center gap-3 bg-slate-50/80 px-3 py-2 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white shadow-sm">
                    {instructor?.avatar_url ? (
                      <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="avatar"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold bg-fbNavy text-white text-xs">
                        {instructor?.full_name?.[0]}
                      </div>
                    )}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-black text-fbNavy leading-none">{instructor?.full_name}</p>
                    <p className="text-[9px] font-bold text-fbOrange uppercase mt-1">Lead Admin</p>
                </div>
             </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
          
          {/* LEFT: FEED */}
          <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
            
            {/* COMPOSER */}
            <motion.div variants={v} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 shrink-0 relative overflow-hidden">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 hidden sm:flex items-center justify-center">
                  {instructor?.avatar_url ? (
                    <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="user"/>
                  ) : (
                    <span className="text-slate-400 font-black">{instructor?.full_name?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                    <textarea 
                        value={announcement} 
                        onChange={(e)=>setAnnouncement(e.target.value)} 
                        className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium border-2 border-transparent focus:bg-white focus:border-fbNavy/5 transition-all outline-none resize-none min-h-[100px]" 
                        placeholder={`Initialize broadcast, Prof. ${instructor?.full_name?.split(' ')[0]}...`} 
                    />
                </div>
              </div>

              {file && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 sm:ml-16 p-3 bg-fbOrange/5 border border-fbOrange/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={18} className="text-fbOrange"/>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <button onClick={()=>setFile(null)} className="p-1 hover:bg-white rounded-lg text-red-400 transition-colors">
                        <X size={16}/>
                    </button>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <button onClick={()=>fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-slate-500 text-[11px] font-black uppercase transition-all border border-slate-100">
                    <ImageIcon size={16} className="text-emerald-500"/> 
                    <span>Media</span>
                  </button>
                  
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <select 
                        value={targetSection} 
                        onChange={(e)=>setTargetSection(e.target.value)} 
                        className="appearance-none bg-white text-[11px] font-black uppercase rounded-xl pl-9 pr-8 py-2.5 border border-slate-100 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                        <option value="all">Global</option>
                        {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                    onClick={handlePost} 
                    disabled={isPosting || (!announcement.trim() && !file)} 
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        isPosting || (!announcement.trim() && !file) 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-fbNavy text-white hover:bg-slate-800 shadow-md active:scale-95'
                    }`}
                >
                    {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{isPosting ? 'Sending...' : 'Post Update'}</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
            </motion.div>

            {/* SCROLLABLE FEED */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {announcements.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <Activity size={40} className="text-slate-300 mb-4"/>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No transmissions found</p>
                </div>
              )}
              {announcements.map(ann => (
                <div key={ann.id} className="hover:-translate-y-0.5 transition-transform">
                    <PostCard ann={ann} instructor={instructor} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: COMMANDS & REGISTRY */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
            
            {/* ACTIVE SECTIONS */}
            <div className="bg-fbNavy rounded-[2.5rem] p-6 shadow-lg text-white shrink-0">
              <div className="flex justify-between items-center mb-5">
                <div>
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Deployment</h3>
                    <h3 className="text-lg font-black italic">Nodes</h3>
                </div>
                <button onClick={()=>setIsModalOpen(true)} className="p-2.5 bg-white/10 hover:bg-fbOrange text-white rounded-xl transition-all border border-white/10 group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform"/>
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                {sections.map(s => (
                  <motion.div 
                    whileHover={{ x: 4 }}
                    key={s.id} 
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-fbOrange rounded-lg flex items-center justify-center font-black text-xs">{s.section_code[0]}</div>
                      <span className="text-xs font-black tracking-widest uppercase">{s.section_code}</span>
                    </div>
                    <ChevronRight size={14} className="text-white/30" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* STUDENT REGISTRY */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden min-h-[400px]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h2 className="text-[10px] font-black text-fbOrange uppercase tracking-widest">Registry</h2>
                        <h2 className="text-lg font-black text-fbNavy tracking-tight">Active Students</h2>
                    </div>
                    <Users size={20} className="text-slate-300"/>
                </div>
                
                <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                    <div className="relative shrink-0">
                        <input 
                            type="text" 
                            placeholder="Search UID or Name..." 
                            onChange={(e)=>setSearchTerm(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:bg-white transition-all outline-none"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    </div>
                    
                    <button onClick={handleExport} className="w-full py-3 bg-slate-50 hover:bg-fbNavy hover:text-white border border-slate-100 text-fbNavy rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <FileDown size={14} />
                        Export Data
                    </button>

                    <div className="overflow-y-auto pr-1 space-y-2 flex-1 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                        {filtered.map(s => (
                            <motion.div 
                                layout
                                initial={{opacity:0}} 
                                animate={{opacity:1}} 
                                exit={{opacity:0}}
                                key={s.id} 
                                className="p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" alt="s"/> : <span className="text-xs font-black text-fbNavy">{s.full_name?.[0]}</span>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{s.full_name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-fbOrange">{s.student_id}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{s.section_code}</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-fbNavy transition-all">
                                        <MoreHorizontal size={16}/>
                                    </button>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </RoleGuard>
  );
}
