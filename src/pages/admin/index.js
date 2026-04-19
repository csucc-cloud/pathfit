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
  Paperclip, Clock, Calendar, Zap, Sparkles, Filter, BarChart3, LayoutDashboard,
  Settings, Bell
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
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-fbNavy/10">
        
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-fbNavy p-1.5 rounded-lg">
                  <Terminal size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-fbNavy">
                  EDU<span className="text-fbOrange">OS</span>
                </h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <button className="px-4 py-2 text-sm font-semibold text-fbNavy bg-slate-100 rounded-lg">Dashboard</button>
                <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-fbNavy transition-colors">Analytics</button>
                <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-fbNavy transition-colors">Schedule</button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">System Live</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-fbNavy transition-colors"><Bell size={20}/></button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-none">{instructor?.full_name}</p>
                  <p className="text-[10px] font-medium text-fbOrange mt-1">Lead Instructor</p>
                </div>
                <div className="w-9 h-9 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-200 shadow-sm">
                  {instructor?.avatar_url ? (
                    <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="avatar"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold bg-fbNavy text-white text-xs">
                      {instructor?.full_name?.[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDEBAR: NAVIGATION & SECTIONS */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Active Nodes</h3>
                  <button onClick={()=>setIsModalOpen(true)} className="p-1.5 text-fbNavy hover:bg-slate-50 rounded-lg transition-all border border-slate-100">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {sections.map(s => (
                    <motion.div 
                      whileHover={{ x: 4 }}
                      key={s.id} 
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 text-fbNavy group-hover:bg-fbNavy group-hover:text-white rounded-xl flex items-center justify-center font-bold text-xs transition-colors">
                          {s.section_code[0]}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{s.section_code}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-fbNavy transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* STATS QUICK VIEW */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Nodes</p>
                  <p className="text-2xl font-black text-fbNavy mt-1">{sections.length}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</p>
                  <p className="text-2xl font-black text-fbNavy mt-1">{students.length}</p>
                </div>
              </div>
            </aside>

            {/* MIDDLE: FEED & COMPOSER */}
            <section className="lg:col-span-6 space-y-6">
              <motion.div initial="hidden" animate="visible" variants={v} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 hidden sm:flex items-center justify-center border border-slate-200 shrink-0">
                    {instructor?.avatar_url ? (
                      <img src={instructor.avatar_url} className="w-full h-full rounded-full object-cover" alt="u"/>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold">{instructor?.full_name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea 
                      value={announcement} 
                      onChange={(e)=>setAnnouncement(e.target.value)} 
                      className="w-full p-0 py-2 bg-transparent text-sm font-medium border-none focus:ring-0 outline-none resize-none min-h-[80px]" 
                      placeholder={`Share an update with your students...`} 
                    />
                  </div>
                </div>

                {file && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-fbNavy"/>
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <button onClick={()=>setFile(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>fileInputRef.current.click()} className="p-2.5 text-slate-500 hover:text-fbNavy hover:bg-slate-50 rounded-xl transition-all">
                      <ImageIcon size={20}/>
                    </button>
                    <div className="h-6 w-px bg-slate-100 mx-1" />
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                      <select 
                        value={targetSection} 
                        onChange={(e)=>setTargetSection(e.target.value)} 
                        className="appearance-none bg-slate-50 text-[11px] font-bold uppercase rounded-xl pl-9 pr-8 py-2 border-none outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <option value="all">Global Broadcast</option>
                        {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handlePost} 
                    disabled={isPosting || (!announcement.trim() && !file)} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isPosting || (!announcement.trim() && !file) 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-fbNavy text-white hover:shadow-lg hover:shadow-fbNavy/20 active:scale-95'
                    }`}
                  >
                    {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{isPosting ? 'Posting...' : 'Post Update'}</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
              </motion.div>

              <div className="space-y-4">
                {announcements.length === 0 && !loading && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <Activity size={32} className="text-slate-200 mx-auto mb-3"/>
                    <p className="text-sm font-medium text-slate-400">No announcements posted yet.</p>
                  </div>
                )}
                {announcements.map(ann => (
                  <PostCard key={ann.id} ann={ann} instructor={instructor} />
                ))}
              </div>
            </section>

            {/* RIGHT SIDEBAR: STUDENT REGISTRY */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-800">Student Registry</h3>
                  <Users size={18} className="text-slate-300"/>
                </div>

                <div className="relative mb-4">
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    onChange={(e)=>setSearchTerm(e.target.value)} 
                    className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:ring-1 ring-slate-100 transition-all outline-none"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                </div>

                <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2 pr-1">
                  <AnimatePresence mode="popLayout">
                    {filtered.map(s => (
                      <motion.div 
                        layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                        key={s.id} 
                        className="p-3 hover:bg-slate-50 rounded-2xl border border-transparent transition-all group cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" alt="s"/> : <span className="text-xs font-bold text-fbNavy">{s.full_name?.[0]}</span>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[11px] font-bold text-slate-800 truncate uppercase">{s.full_name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-fbOrange tracking-tighter">{s.student_id}</span>
                              <span className="text-[9px] font-bold text-slate-400">{s.section_code}</span>
                            </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-fbNavy transition-all">
                            <MoreHorizontal size={14}/>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button onClick={handleExport} className="mt-6 w-full py-3 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                  <FileDown size={14} />
                  Export Data
                </button>
              </div>
            </aside>

          </div>
        </main>

        <CreateSectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
        
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E2E8F0; }
        `}</style>
      </div>
    </RoleGuard>
  );
}
