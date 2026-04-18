// src/pages/admin/index.js
import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, FileDown, Eye, LayoutDashboard, Loader2, Plus, 
  Megaphone, Send, Clock, ChevronRight, Paperclip, X, FileText, 
  Image as ImageIcon, Filter, GraduationCap, Layers, Activity, Calendar,
  MoreHorizontal, MessageSquare, Share2, Globe, Sparkles, Zap, User, ShieldCheck
} from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]); 
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""), 
        [announcement, setAnnouncement] = useState(""), 
        [targetSection, setTargetSection] = useState("all"), 
        [sections, setSections] = useState([]), 
        [isPosting, setIsPosting] = useState(false), 
        [file, setFile] = useState(null), 
        [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch from instructors table
      const { data: prof } = await supabase.from('instructors').select('*').eq('id', user.id).single();
      setInstructorProfile(prof);

      const { data: sectionData } = await supabase.from('sections').select('*').eq('instructor_id', user.id);
      if (sectionData) {
        setSections(sectionData);
        const sectionCodes = sectionData.map(s => s.section_code.trim());
        if (sectionCodes.length > 0) {
          const { data: stud } = await supabase.from('profiles').select('*').in('section_code', sectionCodes).eq('Role', 'student').eq('status', 'active');
          if (stud) setStudents(stud);
        }
      }

      const { data: feedData } = await supabase.from('announcements').select('*').eq('instructor_id', user.id).order('created_at', { ascending: false });
      if (feedData) setAnnouncements(feedData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredStudents = students.filter(s => s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) || s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleExport = () => downloadCSV(filteredStudents.map(s => ({ StudentID: s.student_id, FullName: s.full_name, Course: s.course, Section: s.section_code })), `PATHFit_Student_List`);

  const handlePostAnnouncement = async () => {
    if (!announcement.trim() && !file) return;
    setIsPosting(true);
    try {
      let fileUrl = null, fileType = null;
      if (file) {
        const ext = file.name.split('.').pop(), name = `${Math.random()}.${ext}`;
        await supabase.storage.from('announcement-attachments').upload(name, file);
        fileUrl = supabase.storage.from('announcement-attachments').getPublicUrl(name).publicUrl;
        fileType = ext;
      }
      await supabase.from('announcements').insert([{ content: announcement, target_section: targetSection === 'all' ? null : targetSection, is_global: targetSection === 'all', instructor_id: instructorProfile.id, file_url: fileUrl, file_type: fileType }]);
      setAnnouncement(""); setFile(null); fetchData();
    } catch (err) { alert(err.message); } finally { setIsPosting(false); }
  };

  return (
    <RoleGuard allowedRole="instructor">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1440px] mx-auto space-y-8 p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
        
        {/* HEADER */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl shadow-fbNavy/5 border border-white">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.1 }} className="bg-fbNavy p-4 rounded-3xl rotate-3"><LayoutDashboard className="w-8 h-8 text-white" /></motion.div>
            <div>
              <h1 className="text-3xl font-black text-fbNavy tracking-tight italic uppercase">Faculty <span className="text-fbOrange">Hub</span></h1>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase mt-2"><span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />Portal Connected</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsModalOpen(true)} className="bg-fbNavy text-white font-black px-10 py-5 rounded-[24px] text-[12px] uppercase hover:bg-fbOrange flex items-center gap-3 transition-all"><Plus size={20}/> Create Section</motion.button>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COL */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-fbNavy to-[#1a2a4a] p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <p className="text-[12px] font-black text-fbGray/40 uppercase mb-2">Active Students</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-7xl font-black text-white italic tracking-tighter">{students.length}</h3>
                <span className="text-fbOrange font-bold uppercase text-xs">Total</span>
              </div>
              <Users className="absolute -right-4 -bottom-4 text-white opacity-5 w-40 h-40" />
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
              <h2 className="text-[12px] font-black text-fbNavy uppercase flex items-center gap-3 mb-8"><Layers className="text-fbOrange w-4 h-4"/> Your Sections</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sections.map(sec => (
                  <div key={sec.id} className="p-5 rounded-3xl bg-slate-50 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center font-black text-xs group-hover:bg-fbNavy group-hover:text-white transition-all italic">{sec.section_code.substring(0,2)}</div>
                      <div>
                        <h4 className="font-black text-fbNavy text-sm uppercase">{sec.section_code}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{sec.schedule || "No Schedule"}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-fbOrange" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* FEED COL */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 shadow-xl shadow-fbNavy/5 border border-white">
              <div className="flex gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-fbNavy overflow-hidden shadow-lg border-2 border-white">
                  {instructorProfile?.avatar_url ? <img src={instructorProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-black italic">{instructorProfile?.full_name?.charAt(0)}</div>}
                </div>
                <div className="flex-1">
                  <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder={`Broadcast an update, ${instructorProfile?.full_name?.split(' ')[0] || 'Instructor'}...`} className="w-full bg-[#f8fafc] rounded-[28px] p-6 text-[15px] font-medium text-fbNavy outline-none focus:bg-white transition-all resize-none min-h-[120px]" />
                </div>
              </div>

              <AnimatePresence>
                {file && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0 }} className="mb-6 bg-fbOrange/10 p-4 rounded-[24px] border border-fbOrange/20 flex items-center justify-between">
                    <div className="flex items-center gap-3"><Paperclip className="text-fbOrange" size={18} /><span className="text-[11px] font-black text-fbNavy uppercase truncate max-w-[300px]">{file.name}</span></div>
                    <button onClick={() => setFile(null)} className="text-fbOrange"><X size={20}/></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-[20px] transition-all text-slate-600 font-black text-[11px] uppercase"><ImageIcon size={20} className="text-emerald-500"/> Attachment</button>
                  <div className="relative">
                    <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} className="appearance-none bg-slate-50 rounded-[20px] pl-10 pr-10 py-3 outline-none cursor-pointer font-black text-[11px] uppercase text-slate-600">
                      <option value="all">Global Broadcast</option>
                      {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                    </select>
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fbOrange" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} onClick={handlePostAnnouncement} disabled={isPosting} className="bg-fbOrange text-white px-10 py-4 rounded-[20px] font-black text-[12px] uppercase shadow-xl shadow-fbOrange/20 disabled:opacity-50 flex items-center gap-3">
                  {isPosting ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Post Now
                </motion.button>
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              </div>
            </motion.div>

            <div className="space-y-6 pb-10">
              <AnimatePresence mode='popLayout'>
                {announcements.map((post) => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={post.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
                    {/* FB STYLE HEADER */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-fbNavy overflow-hidden shadow-lg">
                          {instructorProfile?.avatar_url ? <img src={instructorProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-black italic">{instructorProfile?.full_name?.charAt(0)}</div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-black text-fbNavy uppercase italic tracking-tight">{instructorProfile?.full_name || 'Instructor'}</h4>
                            <span className="flex items-center gap-1 bg-blue-50 text-fbNavy text-[9px] px-2 py-0.5 rounded-full font-black uppercase"><ShieldCheck size={10} className="text-blue-500"/> Instructor</span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest mt-0.5">
                            {post.target_section ? `Section ${post.target_section}` : 'Global'} • {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal className="text-slate-300" size={20}/>
                    </div>
                    
                    {/* BODY */}
                    <p className="text-[15px] font-medium text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                    
                    {/* ATTACHMENTS */}
                    {post.file_url && (
                      <div className="rounded-[32px] overflow-hidden border-2 border-dashed border-slate-100 bg-slate-50 p-6 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-4 bg-fbNavy rounded-2xl text-white shadow-lg"><FileText size={24}/></div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Attachment</p>
                              <p className="text-xs font-black text-fbNavy uppercase">Shared Resource</p>
                            </div>
                          </div>
                          <a href={post.file_url} target="_blank" className="bg-white text-fbNavy border border-slate-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-fbNavy hover:text-white transition-all">View File</a>
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-50 flex items-center gap-8">
                      <button className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase hover:text-fbNavy transition-colors"><MessageSquare size={16}/> Discussion</button>
                      <button className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase hover:text-fbOrange transition-colors"><Share2 size={16}/> Forward</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* REGISTRY */}
        <motion.div variants={itemVariants} className="space-y-8 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
            <div>
              <div className="flex items-center gap-3 mb-2"><div className="h-[2px] w-8 bg-fbOrange"/><span className="text-[11px] font-black text-fbOrange uppercase tracking-[0.4em]">Directory Control</span></div>
              <h2 className="text-4xl font-black text-fbNavy italic uppercase tracking-tighter">Student <span className="text-fbOrange">Registry</span></h2>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-[400px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input type="text" placeholder="Search students..." onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[28px] text-[12px] font-black text-fbNavy uppercase outline-none shadow-xl shadow-fbNavy/5" />
              </div>
              <button onClick={handleExport} className="p-5 bg-fbNavy text-white rounded-[24px] hover:bg-fbOrange transition-all shadow-xl"><FileDown size={24}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2">
            <AnimatePresence>
              {filteredStudents.map((s) => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={s.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                      {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-fbNavy flex items-center justify-center text-white font-black text-2xl italic">{s.full_name?.charAt(0)}</div>}
                    </div>
                    <div>
                      <h4 className="font-black text-fbNavy uppercase italic text-lg tracking-tighter group-hover:text-fbOrange transition-colors leading-tight">{s.full_name || "New Student"}</h4>
                      <div className="flex items-center gap-2 mt-2"><GraduationCap size={14} className="text-fbOrange"/><p className="text-[11px] font-bold text-slate-400 uppercase">{s.course || "PATHFIT"}</p></div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between bg-slate-50/50 p-6 rounded-[32px]">
                    <div><span className="text-[10px] font-black text-slate-300 uppercase block mb-2">Section</span><div className="bg-fbNavy text-white px-6 py-2 rounded-2xl text-[11px] font-black italic uppercase">{s.section_code || "N/A"}</div></div>
                    <div className="text-right"><span className="text-[10px] font-black text-slate-300 uppercase block mb-2">ID Number</span><p className="text-sm font-black text-fbNavy tracking-widest">{s.student_id || "PENDING"}</p></div>
                  </div>
                  <button className="w-full mt-8 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-[11px] font-black text-fbNavy uppercase hover:bg-fbNavy hover:text-white transition-all flex items-center justify-center gap-3"><Eye size={18} className="text-fbOrange"/> View Profile</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      <CreateSectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
    </RoleGuard>
  );
}
