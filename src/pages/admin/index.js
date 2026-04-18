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
      <div className="fixed inset-0 -z-10 bg-[#F0F2F5]" /> {/* FB Light Gray Background */}
      
      <motion.div initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.05}}}} className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 font-sans">
        
        {/* HEADER / TOP NAV */}
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-50">
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
                {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold">{instructor?.full_name?.[0]}</div>}
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: DIAGNOSTICS */}
          <div className="lg:col-span-3 space-y-4 hidden lg:block">
            <div className="bg-[#0F172A] rounded-2xl p-5 text-emerald-400 font-mono text-[10px] shadow-lg border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-slate-500 uppercase font-sans font-bold border-b border-slate-800 pb-2">
                <Activity size={14}/> Live Console
              </div>
              <p>&gt; STATUS: <span className="text-emerald-500">READY</span></p>
              <p>&gt; SYNC: {students.length} ENTITIES</p>
              <p>&gt; SECTIONS: {sections.length} NODES</p>
              <p className="animate-pulse">&gt; _</p>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3">Quick Navigation</h3>
              <ul className="space-y-2 text-xs font-bold text-slate-600">
                <li className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all"><Users size={16} className="text-fbNavy"/> Student Directory</li>
                <li className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all"><FileText size={16} className="text-fbOrange"/> Grading Sheets</li>
              </ul>
            </div>
          </div>

          {/* MIDDLE COLUMN: FB STYLE FEED */}
          <div className="lg:col-span-6 space-y-5">
            {/* POST COMPOSER */}
            <motion.div variants={v} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                  {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center">{instructor?.full_name?.[0]}</div>}
                </div>
                <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-full px-5 text-left text-slate-500 text-sm transition-colors">
                  Post a new school announcement...
                </button>
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
              <textarea value={announcement} onChange={(e)=>setAnnouncement(e.target.value)} className="w-full mt-3 p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-0 resize-none min-h-[60px]" placeholder="What's on your mind?" />
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e)=>setFile(e.target.files[0])}/>
              {file && <div className="mt-2 text-[10px] bg-fbOrange/10 text-fbOrange p-2 rounded flex justify-between items-center font-bold uppercase"><span>{file.name}</span><X size={14} onClick={()=>setFile(null)} className="cursor-pointer"/></div>}
            </motion.div>

            {/* FEED CARDS */}
            <div className="space-y-4">
              {announcements.map(ann => (
                <motion.div key={ann.id} variants={v} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-fbNavy flex items-center justify-center text-white text-sm font-bold">
                           {instructor?.avatar_url ? <img src={instructor.avatar_url} className="rounded-full"/> : instructor?.full_name?.[0]}
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
                      <a href={ann.file_url} target="_blank" className="text-xs font-black text-fbOrange uppercase hover:underline">Download</a>
                    </div>
                  )}
                  {/* FB ACTIONS */}
                  <div className="px-4 py-1 border-t border-slate-100 flex items-center justify-between">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-sm font-bold transition-all"><ThumbsUp size={18}/> Like</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-sm font-bold transition-all"><MessageSquare size={18}/> Comment</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-500 text-sm font-bold transition-all"><Share2 size={18}/> Share</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: SECTIONS */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
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
          </div>
        </div>

        {/* REGISTRY SECTION: MOVED TO BOTTOM FOR CLEANER FLOW */}
        <motion.section variants={v} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-fbNavy uppercase italic">Student <span className="text-fbOrange">Registry</span></h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Manage Enrolled Entities</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <input type="text" placeholder="Filter by Name or ID..." onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:bg-white transition-all outline-none"/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
              </div>
              <button onClick={handleExport} className="p-2 bg-fbNavy text-white rounded-xl hover:bg-fbOrange transition-colors"><FileDown size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filtered.map(s => (
                <motion.div layout initial={{opacity:0}} animate={{opacity:1}} key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover"/> : <div className="text-xs font-bold text-fbNavy">{s.full_name?.[0]}</div>}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-[11px] font-bold text-slate-900 truncate uppercase">{s.full_name}</h4>
                      <p className="text-[9px] font-black text-fbOrange">{s.student_id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase px-1">
                    <span>Sec: {s.section_code}</span>
                    <button className="text-fbNavy hover:text-fbOrange transition-colors flex items-center gap-1"><Eye size={12}/> Profile</button>
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
