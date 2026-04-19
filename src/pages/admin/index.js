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
      {/* ADVANCED AMBIENT BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[#F1F5F9] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fbNavy/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fbOrange/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay" />
      </div>
      
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{visible:{transition:{staggerChildren:0.05}}}} 
        className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 font-sans lg:h-[100dvh] flex flex-col overflow-x-hidden pt-2 lg:pt-6"
      >
        
        {/* NEUMORPHIC HEADER */}
        <header className="flex justify-between items-center bg-white/70 backdrop-blur-xl p-4 md:p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 z-50 shrink-0 mt-4 md:mt-6 lg:mt-0">
          <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-fbNavy to-fbOrange rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-3 bg-fbNavy rounded-xl text-white shadow-xl">
                    <Terminal size={20} className="group-hover:rotate-12 transition-transform"/>
                </div>
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-black text-fbNavy tracking-tight flex items-center gap-2 leading-none">
                    EDU<span className="text-fbOrange tracking-widest">OS</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Node Active</span>
                </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-8 mr-4">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Students</p>
                    <p className="text-sm font-bold text-fbNavy">{students.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Sections</p>
                    <p className="text-sm font-bold text-fbNavy">{sections.length}</p>
                </div>
             </div>
             <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block" />
             <div className="flex items-center gap-3 bg-slate-50/50 p-1.5 pr-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fbNavy to-slate-800 p-[2px] shadow-inner">
                    <div className="w-full h-full rounded-[10px] overflow-hidden bg-white">
                        {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="avatar"/> : <div className="w-full h-full flex items-center justify-center font-bold bg-fbNavy text-white">{instructor?.full_name?.[0]}</div>}
                    </div>
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-black text-fbNavy leading-none">{instructor?.full_name}</p>
                    <p className="text-[10px] font-bold text-fbOrange uppercase tracking-tight mt-1">Lead Instructor</p>
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto lg:overflow-hidden min-h-0 pb-10 lg:pb-0">
          
          {/* MAIN COMMUNICATION STREAM */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col space-y-6 lg:overflow-hidden min-h-0 order-1">
            
            {/* FLOATING COMPOSER */}
            <motion.div variants={v} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl shadow-fbNavy/5 border border-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={120} className="text-fbNavy" />
              </div>
              
              <div className="flex gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0 overflow-hidden border-4 border-white shadow-xl hidden xs:block ring-1 ring-slate-100">
                  {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="user"/> : <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold">{instructor?.full_name?.[0]}</div>}
                </div>
                <div className="flex-1 relative">
                    <textarea 
                        value={announcement} 
                        onChange={(e)=>setAnnouncement(e.target.value)} 
                        className="w-full p-6 bg-slate-50/80 rounded-[2rem] text-sm font-medium border-2 border-transparent focus:border-fbNavy/10 focus:bg-white focus:ring-[12px] focus:ring-fbNavy/5 transition-all outline-none resize-none min-h-[120px] shadow-inner" 
                        placeholder={`Broadcast a new update, Prof. ${instructor?.full_name?.split(' ')[1] || instructor?.full_name?.split(' ')[0]}...`} 
                    />
                    <div className="absolute bottom-4 right-6 flex items-center gap-2 text-slate-300 pointer-events-none italic text-[10px]">
                        <Zap size={10}/> Instant Sync Enabled
                    </div>
                </div>
              </div>

              {/* DYNAMIC FILE CHIP */}
              {file && (
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 xs:ml-20 p-4 bg-gradient-to-r from-fbOrange/10 to-transparent border-l-4 border-fbOrange rounded-r-2xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-fbOrange text-white rounded-xl shadow-lg shadow-fbOrange/30">
                            <FileText size={20}/>
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800">{file.name}</p>
                            <p className="text-[10px] text-fbOrange font-bold uppercase tracking-widest mt-0.5">Media Pipeline Locked</p>
                        </div>
                    </div>
                    <button onClick={()=>setFile(null)} className="p-2 bg-white hover:bg-red-50 text-red-400 rounded-full shadow-sm transition-all">
                        <X size={20}/>
                    </button>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={()=>fileInputRef.current.click()} className="group flex items-center gap-3 px-5 py-3 bg-white hover:bg-emerald-50 rounded-2xl text-slate-600 text-[11px] font-black uppercase tracking-tighter transition-all border border-slate-100 hover:border-emerald-200 hover:text-emerald-600">
                    <ImageIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/> 
                    <span>Add Resources</span>
                  </button>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Globe size={14} className="text-fbNavy/40"/>
                    </div>
                    <select 
                        value={targetSection} 
                        onChange={(e)=>setTargetSection(e.target.value)} 
                        className="appearance-none bg-slate-50 hover:bg-white text-[11px] font-black uppercase tracking-tighter rounded-2xl pl-10 pr-10 py-3 border border-slate-100 outline-none transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <option value="all">Global Broadcast</option>
                        {sections.map(s => <option key={s.id} value={s.section_code}>Section {s.section_code}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none group-hover:text-fbNavy transition-colors"/>
                  </div>
                </div>

                <button 
                    onClick={handlePost} 
                    disabled={isPosting || (!announcement.trim() && !file)} 
                    className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] transition-all shadow-2xl overflow-hidden ${
                        isPosting || (!announcement.trim() && !file) 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-fbNavy text-white hover:shadow-fbNavy/40 active:scale-95'
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-fbOrange to-fbNavy opacity-0 group-hover:opacity-20 transition-opacity" />
                    {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                    <span>{isPosting ? 'Broadcasting...' : 'Publish Update'}</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
            </motion.div>

            {/* FEED WITH SKEUOMORPHIC DEPTH */}
            <div className="flex-1 lg:overflow-y-auto pr-2 space-y-6 custom-scrollbar lg:pb-10">
              {announcements.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-24 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="p-6 bg-white rounded-full shadow-xl mb-6">
                        <Activity size={48} className="text-slate-200"/>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Signal Flatline: No Activity</p>
                </div>
              )}

              {announcements.map(ann => (
                <div key={ann.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                    <PostCard ann={ann} instructor={instructor} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COMMAND PANEL */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col space-y-8 lg:overflow-hidden min-h-0 order-2">
            
            {/* SECTIONS - RADIAL GLASS DESIGN */}
            <div className="bg-gradient-to-br from-fbNavy to-[#1a2b4b] rounded-[2.5rem] p-6 shadow-2xl shadow-fbNavy/20 text-white shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Command</h3>
                    <h3 className="text-lg font-black tracking-tight">Active Nodes</h3>
                </div>
                <button onClick={()=>setIsModalOpen(true)} className="p-3 bg-white/10 hover:bg-fbOrange text-white rounded-2xl transition-all backdrop-blur-md border border-white/10 group">
                    <Plus size={22} className="group-rotate-90 transition-transform"/>
                </button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {sections.map(s => (
                  <motion.div 
                    whileHover={{ x: 10 }}
                    key={s.id} 
                    className="flex items-center justify-between group cursor-pointer p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-fbOrange rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-fbOrange/20">{s.section_code[0]}</div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest block">{s.section_code}</span>
                        <span className="text-[9px] text-white/50 font-bold">Online Registry</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-fbNavy transition-all">
                        <ChevronRight size={18} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* REGISTRY - LIST VIEW */}
            <div className="bg-white rounded-[2.5rem] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col lg:flex-1 lg:overflow-hidden min-h-[500px] lg:min-h-0 relative">
                <div className="flex justify-between items-end mb-6 shrink-0">
                    <div>
                        <h2 className="text-xs font-black text-fbOrange uppercase tracking-[0.2em] mb-1 italic">Intel</h2>
                        <h2 className="text-xl font-black text-fbNavy tracking-tighter">Student Body</h2>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-fbNavy">
                        <Users size={20}/>
                    </div>
                </div>
                
                <div className="flex flex-col flex-1 lg:overflow-hidden space-y-6">
                    <div className="relative shrink-0">
                        <input 
                            type="text" 
                            placeholder="Search identities..." 
                            onChange={(e)=>setSearchTerm(e.target.value)} 
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:bg-white focus:border-fbNavy/5 focus:ring-4 focus:ring-fbNavy/5 transition-all outline-none shadow-inner"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Filter size={14} className="text-slate-300"/>
                        </div>
                    </div>
                    
                    <button onClick={handleExport} className="group w-full py-4 bg-white border-2 border-fbNavy/10 text-fbNavy rounded-2xl hover:bg-fbNavy hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-fbNavy/5 active:scale-95 shrink-0 flex items-center justify-center gap-3">
                        <FileDown size={16} className="group-hover:bounce" />
                        Intelligence Export
                    </button>

                    <div className="lg:overflow-y-auto pr-2 flex-1 space-y-3 custom-scrollbar min-h-0">
                        <AnimatePresence mode="popLayout">
                        {filtered.map(s => (
                            <motion.div 
                                layout
                                initial={{opacity:0, scale:0.95}} 
                                animate={{opacity:1, scale:1}} 
                                exit={{opacity:0, scale:0.95}}
                                key={s.id} 
                                className="bg-slate-50/40 p-4 rounded-[1.5rem] border border-slate-100/50 shrink-0 group hover:bg-white hover:shadow-2xl hover:shadow-fbNavy/10 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-fbOrange transition-all duration-500 shadow-sm">
                                            {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" alt="student"/> : <div className="text-xs font-black text-fbNavy">{s.full_name?.[0]}</div>}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div className="overflow-hidden min-w-0 flex-1">
                                        <h4 className="text-xs font-black text-slate-800 truncate uppercase tracking-tight group-hover:text-fbNavy transition-colors">{s.full_name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-fbOrange/10 text-fbOrange text-[8px] font-black rounded-md">{s.student_id}</span>
                                            <span className="text-[10px] font-bold text-slate-400">●</span>
                                            <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{s.section_code}</span>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-fbNavy transition-all">
                                        <MoreHorizontal size={18}/>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; border: 2px solid transparent; background-clip: content-box; }
        
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .group:hover .bounce { animation: bounce 1s infinite; }

        @media (max-width: 1024px) {
          .custom-scrollbar { overflow-y: visible !important; }
        }
      `}</style>
    </RoleGuard>
  );
}
