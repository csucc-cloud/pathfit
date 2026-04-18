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
      
      {/* Container is fixed to viewport height to ensure two-column scrolling */}
      <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.05}}}} className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 font-sans h-screen flex flex-col overflow-hidden">
        
        {/* HEADER / TOP NAV */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 z-50 shrink-0">
          <h1 className="text-xl font-black text-fbNavy tracking-tighter flex items-center gap-2">
            <div className="p-1.5 bg-fbNavy rounded-lg text-white"><Terminal size={18}/></div>
            PORTAL <span className="text-fbOrange">HUB</span>
          </h1>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-slate-900 leading-none">{instructor?.full_name}</p>
                <p className="text-[9px] font-bold text-fbOrange uppercase">Administrator</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="avatar"/> : <div className="w-full h-full flex items-center justify-center font-bold">{instructor?.full_name?.[0]}</div>}
             </div>
          </div>
        </header>

        {/* 2 COLUMN GRID (Force strict 12/16 and 4/16 split) */}
        <div className="flex-1 grid grid-cols-16 gap-6 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN (12/16): FB STYLE FEED */}
          <div className="col-span-12 flex flex-col space-y-5 overflow-hidden min-h-0">
            
            {/* POST COMPOSER */}
            <motion.div variants={v} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 shrink-0">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                  {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="user"/> : <div className="w-full h-full flex items-center justify-center">{instructor?.full_name?.[0]}</div>}
                </div>
                <div className="flex-1 space-y-3">
                    <textarea 
                        value={announcement} 
                        onChange={(e)=>setAnnouncement(e.target.value)} 
                        className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-0 resize-none min-h-[60px]" 
                        placeholder="Post a new school announcement..." 
                    />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={()=>fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-xs font-bold transition-all"><ImageIcon size={16} className="text-emerald-500"/> Photo/File</button>
                  <select value={targetSection} onChange={(e)=>setTargetSection(e.target.value)} className="bg-slate-50 text-[10px] font-bold uppercase rounded-lg px-2 border-none outline-none">
                    <option value="all">Public</option>
                    {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                  </select>
                </div>
                {announcement.trim() || file ? (
                  <button onClick={handlePost} disabled={isPosting} className="bg-fbNavy text-white px-4 py-1.5 rounded-lg text-xs font-bold">Post</button>
                ) : null}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
              {file && <div className="mt-2 text-[10px] bg-fbOrange/10 text-fbOrange p-2 rounded flex justify-between items-center font-bold uppercase"><span>{file.name}</span><X size={14} onClick={()=>setFile(null)} className="cursor-pointer"/></div>}
            </motion.div>

            {/* SCROLLABLE FEED AREA */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">
              {announcements.map(ann => (
                <motion.div key={ann.id} variants={v} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-fbNavy flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                           {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="instructor"/> : instructor?.full_name?.[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">{instructor?.full_name} <ShieldCheck size={14} className="text-blue-500 fill-blue-500 text-white"/></h4>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">{new Date(ann.created_at).toLocaleDateString()} • <Globe size={10}/> {ann.target_section || "Global"}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:bg-slate-50 p-1 rounded-full"><MoreHorizontal size={20}/></button>
                    </div>
                    <p className="mt-3 text-[14px] text-slate-800 leading-normal">{ann.content}</p>
                  </div>
                  {ann.file_url && (
                    <div className="border-t border-slate-50 bg-slate-50/50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2"><FileText size={18} className="text-fbNavy"/><span className="text-xs font-bold text-slate-600">Learning Resource Attached</span></div>
                      <a href={ann.file_url} target="_blank" rel="noreferrer" className="text-xs font-black text-fbOrange uppercase hover:underline">Download</a>
                    </div>
                  )}
                  <div className="px-4 py-1 border-t border-slate-100 flex items-center justify-between">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-sm font-bold transition-all"><ThumbsUp size={18}/> Like</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-sm font-bold transition-all"><MessageSquare size={18}/> Comment</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-sm font-bold transition-all"><Share2 size={18}/> Share</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN (4/16): SIDEBAR (SECTIONS & REGISTRY) */}
          <div className="col-span-4 flex flex-col space-y-6 overflow-hidden min-h-0">
            
            {/* ACTIVE SECTIONS CARD */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Active Sections</h3>
                <button onClick={()=>setIsModalOpen(true)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"><Plus size={16}/></button>
              </div>
              <div className="space-y-3">
                {sections.map(s => (
                  <div key={s.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-[10px] text-fbNavy">{s.section_code[0]}</div>
                      <span className="text-xs font-bold text-slate-700">{s.section_code}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-fbOrange transition-all"/>
                  </div>
                ))}
              </div>
            </div>

            {/* STUDENT REGISTRY CARD */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="mb-4 shrink-0">
                    <h2 className="text-sm font-black text-fbNavy uppercase italic">Student <span className="text-fbOrange">Registry</span></h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Manage Entities</p>
                </div>
                
                <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
                    <div className="relative shrink-0">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            onChange={(e)=>setSearchTerm(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-2 text-[11px] font-bold focus:bg-white outline-none"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12}/>
                    </div>
                    
                    <button onClick={handleExport} className="w-full py-2 bg-fbNavy text-white rounded-lg hover:bg-fbOrange transition-colors text-[10px] font-bold flex items-center justify-center gap-2 shrink-0">
                        <FileDown size={14}/> EXPORT CSV
                    </button>

                    <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar pb-4">
                        <AnimatePresence>
                        {filtered.map(s => (
                            <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={s.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" alt="student"/> : <div className="text-[10px] font-bold text-fbNavy">{s.full_name?.[0]}</div>}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-[10px] font-bold text-slate-900 truncate uppercase">{s.full_name}</h4>
                                        <p className="text-[8px] font-black text-fbOrange">{s.student_id}</p>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </RoleGuard>
  );
}
