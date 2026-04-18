import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, FileDown, Eye, Loader2, Plus, Send, ChevronRight, 
  X, FileText, Image as ImageIcon, MessageSquare, 
  Globe, ShieldCheck, Activity, Terminal, Share2, ThumbsUp, MoreHorizontal
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
      <div className="fixed inset-0 -z-10 bg-[#F0F2F5]" /> 
      
      {/* HEADER / TOP NAV - Optimized for Portrait Visibility */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white flex justify-between items-center px-4 md:px-8 shadow-sm border-b border-slate-200 z-[100]">
        <h1 className="text-lg md:text-xl font-black text-fbNavy tracking-tighter flex items-center gap-2">
          <div className="p-1.5 bg-fbNavy rounded-lg text-white shrink-0"><Terminal size={18}/></div>
          <span className="hidden xs:block">PORTAL <span className="text-fbOrange">HUB</span></span>
        </h1>
        
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-[12px] font-bold text-slate-900 leading-none">{instructor?.full_name}</p>
              <p className="text-[9px] font-bold text-fbOrange uppercase tracking-tighter">Administrator</p>
           </div>
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shadow-inner">
              {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{instructor?.full_name?.[0]}</div>}
           </div>
        </div>
      </header>

      <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.05}}}} className="max-w-[1400px] mx-auto pt-20 p-4 md:p-6 space-y-6 font-sans">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: DIAGNOSTICS & QUICK NAV */}
          <div className="lg:col-span-3 space-y-4 hidden lg:block sticky top-20">
            <div className="bg-[#0F172A] rounded-2xl p-5 text-emerald-400 font-mono text-[11px] shadow-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-500 uppercase font-sans font-black border-b border-slate-800 pb-2">
                <Activity size={14}/> Live Console
              </div>
              <div className="space-y-1.5">
                <p>&gt; STATUS: <span className="text-emerald-500 font-bold">READY</span></p>
                <p>&gt; SYNC: {students.length} ENTITIES</p>
                <p>&gt; NODES: {sections.length} ACTIVE</p>
                <p className="animate-pulse">&gt; _</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Navigation</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-fbNavy/10 group-hover:text-fbNavy transition-colors"><Users size={16}/></div>
                  <span className="text-xs font-bold text-slate-600">Student Directory</span>
                </li>
                <li className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-fbOrange/10 group-hover:text-fbOrange transition-colors"><FileText size={16}/></div>
                  <span className="text-xs font-bold text-slate-600">Grading Sheets</span>
                </li>
              </ul>
            </div>
          </div>

          {/* MIDDLE COLUMN: FB STYLE FEED */}
          <div className="lg:col-span-6 space-y-5">
            {/* POST COMPOSER */}
            <motion.div variants={v} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                  {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold">{instructor?.full_name?.[0]}</div>}
                </div>
                <div className="flex-1">
                  <textarea 
                    value={announcement} 
                    onChange={(e)=>setAnnouncement(e.target.value)} 
                    className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white focus:ring-2 ring-slate-200 rounded-2xl px-4 py-3 text-sm transition-all outline-none border-none resize-none min-h-[80px]" 
                    placeholder={`What's on your mind, ${instructor?.full_name?.split(' ')[0]}?`}
                  />
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={()=>fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg text-slate-500 text-xs font-bold transition-all">
                    <ImageIcon size={16} className="text-emerald-500"/> <span>Photo/File</span>
                  </button>
                  <div className="relative">
                    <select value={targetSection} onChange={(e)=>setTargetSection(e.target.value)} className="appearance-none bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase rounded-lg pl-8 pr-4 py-2 border-none outline-none cursor-pointer transition-colors">
                      <option value="all">Public</option>
                      {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                    </select>
                    <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
                  </div>
                </div>
                
                <button 
                  onClick={handlePost} 
                  disabled={isPosting || (!announcement.trim() && !file)} 
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all shadow-md ${announcement.trim() || file ? 'bg-fbNavy text-white hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  {isPosting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Post
                </button>
              </div>
              
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
              {file && (
                <div className="mt-3 text-[10px] bg-fbOrange/5 text-fbOrange p-2.5 rounded-xl border border-fbOrange/10 flex justify-between items-center font-bold animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-2"><FileText size={14}/> {file.name}</div>
                  <X size={16} onClick={()=>setFile(null)} className="cursor-pointer hover:bg-fbOrange/10 rounded-full p-0.5"/>
                </div>
              )}
            </motion.div>

            {/* FEED CARDS */}
            <div className="space-y-4">
              {announcements.map(ann => (
                <motion.div key={ann.id} variants={v} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
                  <div className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-fbNavy flex items-center justify-center text-white text-sm font-bold border border-slate-100 shadow-sm shrink-0">
                           {instructor?.avatar_url ? <img src={instructor.avatar_url} className="rounded-full w-full h-full object-cover"/> : instructor?.full_name?.[0]}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                            {instructor?.full_name} 
                            <ShieldCheck size={14} className="text-blue-500 fill-blue-500 text-white"/>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            {new Date(ann.created_at).toLocaleDateString()} • <Globe size={10}/> <span className="uppercase tracking-tighter">{ann.target_section || "Global Feed"}</span>
                          </p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:bg-slate-50 p-1.5 rounded-full transition-colors"><MoreHorizontal size={20}/></button>
                    </div>
                    <p className="mt-3 text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  </div>

                  {ann.file_url && (
                    <div className="mx-4 mb-2 mt-2 border border-slate-100 bg-slate-50 rounded-xl p-3 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform"><FileText size={20} className="text-fbNavy"/></div>
                        <div>
                          <p className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">Learning Resource</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Ready for review</p>
                        </div>
                      </div>
                      <a href={ann.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-fbOrange uppercase hover:bg-fbOrange hover:text-white transition-all shadow-sm">Download</a>
                    </div>
                  )}

                  {/* SOCIAL ACTIONS BAR */}
                  <div className="px-4 py-1 border-t border-slate-100 mt-2 flex items-center justify-between">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 rounded-lg text-slate-500 text-[13px] font-bold transition-all"><ThumbsUp size={18}/> Like</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 rounded-lg text-slate-500 text-[13px] font-bold transition-all"><MessageSquare size={18}/> Comment</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-100 rounded-lg text-slate-500 text-[13px] font-bold transition-all"><Share2 size={18}/> Share</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: SECTIONS WIDGET */}
          <div className="lg:col-span-3 space-y-4 sticky top-20">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Sections</h3>
                <button onClick={()=>setIsModalOpen(true)} className="p-1.5 bg-fbOrange/10 text-fbOrange hover:bg-fbOrange hover:text-white rounded-lg transition-all shadow-sm"><Plus size={16}/></button>
              </div>
              <div className="space-y-1">
                {sections.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl group cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-fbNavy/5 rounded-lg flex items-center justify-center font-black text-[10px] text-fbNavy group-hover:bg-fbNavy group-hover:text-white transition-all">{s.section_code[0]}</div>
                      <span className="text-xs font-bold text-slate-700">{s.section_code}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-fbOrange group-hover:translate-x-1 transition-all"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* REGISTRY SECTION */}
        <motion.section variants={v} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-fbNavy uppercase italic tracking-tighter">Student <span className="text-fbOrange underline decoration-4 underline-offset-4">Registry</span></h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Enrollment Node Management</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input 
                  type="text" 
                  placeholder="Filter by Name or ID..." 
                  onChange={(e)=>setSearchTerm(e.target.value)} 
                  className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:bg-white focus:ring-2 ring-slate-200 transition-all outline-none shadow-inner"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              </div>
              <button onClick={handleExport} className="p-3 bg-fbNavy text-white rounded-xl hover:bg-fbOrange hover:shadow-lg hover:shadow-fbOrange/20 transition-all"><FileDown size={22}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            <AnimatePresence>
              {filtered.map(s => (
                <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} key={s.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-fbOrange/30 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:rotate-3 transition-transform">
                      {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover"/> : <div className="text-sm font-black text-fbNavy uppercase">{s.full_name?.[0]}</div>}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-[12px] font-black text-slate-900 truncate uppercase leading-tight group-hover:text-fbNavy transition-colors">{s.full_name}</h4>
                      <p className="text-[10px] font-bold text-fbOrange tracking-tighter mt-0.5">{s.student_id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div className="bg-slate-100 px-2 py-1 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter">Sec: {s.section_code}</div>
                    <button className="text-fbNavy hover:text-fbOrange font-black text-[10px] uppercase flex items-center gap-1 transition-colors"><Eye size={14}/> View</button>
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
