// src/pages/admin/index.js
import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, FileDown, Eye, LayoutDashboard, Loader2, Plus, 
  Send, ChevronRight, Paperclip, X, FileText, 
  Image as ImageIcon, GraduationCap, Layers, 
  MoreHorizontal, MessageSquare, Share2, Globe, ShieldCheck, 
  Trophy, TrendingUp, Bell
} from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
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
        const ext = file.name.split('.').pop(), name = `${Date.now()}.${ext}`;
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
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-[#F4F7FE] min-h-screen p-4 lg:p-10 font-sans text-slate-900">
        
        {/* --- TOP BAR --- */}
        <motion.nav variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-black text-fbNavy uppercase tracking-tight">Management <span className="text-fbOrange">Console</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Academic Year 2024-2025</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-100">
              <div className="w-10 h-10 rounded-full bg-fbNavy flex items-center justify-center text-white font-bold overflow-hidden shadow-inner">
                 {instructorProfile?.avatar_url ? <img src={instructorProfile.avatar_url} className="object-cover w-full h-full" /> : instructorProfile?.full_name?.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-black text-fbNavy leading-none">{instructorProfile?.full_name || 'Instructor'}</p>
                <p className="text-[10px] font-bold text-fbOrange uppercase">Faculty Member</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-fbNavy transition-colors"><Bell size={20}/></button>
          </div>
        </motion.nav>

        {/* --- STATS BENTO GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Students', val: students.length, icon: Users, color: 'bg-blue-500', trend: '+12% this month' },
            { label: 'Active Sections', val: sections.length, icon: Layers, color: 'bg-emerald-500', trend: 'Full capacity' },
            { label: 'Announcements', val: announcements.length, icon: Send, color: 'bg-fbOrange', trend: '4 today' },
            { label: 'Engagement Rate', val: '94%', icon: TrendingUp, color: 'bg-purple-500', trend: 'High activity' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white p-6 rounded-[32px] shadow-sm border border-white flex items-center gap-5 group hover:shadow-xl transition-all">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-opacity-20`}><stat.icon size={24}/></div>
              <div>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-fbNavy">{stat.val}</h3>
                <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">{stat.trend}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- MAIN FEED (CENTER) --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* POST BOX */}
            <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 shadow-sm border border-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black text-fbNavy uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fbOrange animate-ping"/> Create Broadcast
                </h2>
                <div className="relative">
                    <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} className="appearance-none bg-slate-50 rounded-xl pl-10 pr-10 py-2.5 outline-none cursor-pointer font-black text-[10px] uppercase text-fbNavy border border-slate-100">
                      <option value="all">Global Broadcast</option>
                      {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                    </select>
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-fbOrange" />
                </div>
              </div>
              
              <div className="relative mb-6">
                <textarea 
                  value={announcement} 
                  onChange={(e) => setAnnouncement(e.target.value)} 
                  placeholder={`What's happening in your classes?`} 
                  className="w-full bg-slate-50 rounded-3xl p-6 text-sm font-medium text-fbNavy outline-none focus:ring-4 focus:ring-fbOrange/5 transition-all resize-none min-h-[140px] border border-transparent focus:border-fbOrange/20" 
                />
              </div>

              <AnimatePresence>
                {file && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="mb-6 bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3"><FileText size={18} className="text-fbOrange"/><span className="text-[10px] font-bold uppercase truncate max-w-[200px]">{file.name}</span></div>
                    <button onClick={() => setFile(null)} className="hover:text-fbOrange"><X size={18}/></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <button onClick={() => fileInputRef.current.click()} className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 text-[10px] font-black uppercase">
                  <ImageIcon size={18} className="text-blue-500"/> Add Media
                </button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePostAnnouncement} 
                  disabled={isPosting} 
                  className="bg-fbNavy text-white px-8 py-4 rounded-2xl font-black text-[12px] uppercase shadow-lg shadow-fbNavy/20 disabled:opacity-50 flex items-center gap-3"
                >
                  {isPosting ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Broadcast Post
                </motion.button>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            </motion.div>

            {/* FEED */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activity</h3>
                <button className="text-[10px] font-black text-fbOrange uppercase border-b-2 border-fbOrange/20">View All Archive</button>
              </div>

              <AnimatePresence mode='popLayout'>
                {announcements.map((post) => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={post.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-white hover:border-slate-100 transition-all">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner border border-slate-100 overflow-hidden">
                           {instructorProfile?.avatar_url ? <img src={instructorProfile.avatar_url} className="object-cover w-full h-full" /> : <User size={20} className="text-slate-300"/>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[13px] font-black text-fbNavy uppercase tracking-tight">{instructorProfile?.full_name}</h4>
                            <ShieldCheck size={14} className="text-blue-500"/>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            {post.target_section ? `Pinned to ${post.target_section}` : 'Global Post'} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><MoreHorizontal size={18} className="text-slate-300"/></button>
                    </div>
                    
                    <p className="text-[15px] font-medium text-slate-600 leading-relaxed mb-6">{post.content}</p>
                    
                    {post.file_url && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm"><FileText size={18} className="text-fbNavy"/></div>
                          <span className="text-[10px] font-black text-fbNavy uppercase">Course_Attachment.pdf</span>
                        </div>
                        <a href={post.file_url} target="_blank" className="text-fbOrange font-black text-[10px] uppercase underline underline-offset-4">Download</a>
                      </div>
                    )}

                    <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                      <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-fbNavy"><MessageSquare size={14}/> 0 Comments</button>
                      <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-fbNavy"><Share2 size={14}/> Share</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* --- SIDEBAR (RIGHT) --- */}
          <div className="lg:col-span-4 space-y-8">
            {/* QUICK SEARCH */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] shadow-sm border border-white">
              <h3 className="text-xs font-black text-fbNavy uppercase mb-6 flex items-center gap-2"><Search size={16} className="text-fbOrange"/> Registry Finder</h3>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Student name or ID..." 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-fbOrange/10" 
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
              </div>
              <button onClick={handleExport} className="w-full py-4 bg-fbNavy text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-fbNavy/20 hover:bg-fbOrange transition-all">
                <FileDown size={16}/> Export Student Data
              </button>
            </motion.div>

            {/* SECTION LIST */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] shadow-sm border border-white overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-fbNavy uppercase flex items-center gap-2"><Layers size={16} className="text-fbOrange"/> Your Sections</h3>
                <button onClick={() => setIsModalOpen(true)} className="p-2 bg-fbOrange/10 text-fbOrange rounded-xl hover:bg-fbOrange hover:text-white transition-all"><Plus size={16}/></button>
              </div>
              <div className="space-y-3">
                {sections.map(sec => (
                  <div key={sec.id} className="group p-4 rounded-2xl bg-slate-50 flex items-center justify-between border border-transparent hover:border-fbOrange/20 hover:bg-white hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-[10px] text-fbNavy group-hover:bg-fbNavy group-hover:text-white transition-all uppercase">{sec.section_code.substring(0,2)}</div>
                      <div>
                        <p className="text-[11px] font-black text-fbNavy uppercase leading-none">{sec.section_code}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{sec.schedule || 'TBA'}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-fbOrange" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* TOP PERFORMERS OR RECENT LOGS */}
            <motion.div variants={itemVariants} className="bg-fbNavy p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
               <Trophy className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
               <p className="text-[10px] font-black text-fbOrange uppercase tracking-[0.2em] mb-2">Academic Achievement</p>
               <h3 className="text-white font-black text-xl italic uppercase tracking-tighter mb-4">Top Performing <br/>Section</h3>
               <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">#1</div>
                  <div className="text-[10px] font-bold text-white uppercase">Section PF-A1 <br/> <span className="text-fbOrange">98% Completion</span></div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* --- GRID LIST (STUDENTS) --- */}
        <motion.section variants={itemVariants} className="mt-16">
          <div className="flex items-center justify-between mb-10 px-4">
             <div>
                <h2 className="text-3xl font-black text-fbNavy uppercase tracking-tighter">Student <span className="text-fbOrange">Registry</span></h2>
                <div className="h-1 w-20 bg-fbOrange mt-1 rounded-full"/>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredStudents.map((s) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={s.id} className="bg-white p-8 rounded-[40px] border border-white shadow-sm hover:shadow-2xl transition-all group relative">
                  <div className="absolute top-6 right-6 text-fbOrange opacity-0 group-hover:opacity-100 transition-opacity"><ShieldCheck size={20}/></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-[6px] border-white shadow-xl flex items-center justify-center overflow-hidden mb-6 group-hover:scale-105 transition-transform">
                      {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-fbNavy flex items-center justify-center text-white font-black text-3xl">{s.full_name?.charAt(0)}</div>}
                    </div>
                    <h4 className="font-black text-fbNavy uppercase italic text-lg leading-tight group-hover:text-fbOrange transition-colors">{s.full_name || "New Student"}</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase mt-1 tracking-widest">{s.student_id || "No ID"}</p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-3 rounded-2xl text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Section</span>
                      <span className="text-[11px] font-black text-fbNavy uppercase">{s.section_code || "—"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Status</span>
                      <span className="text-[11px] font-black text-emerald-500 uppercase">Active</span>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-fbOrange transition-all flex items-center justify-center gap-2">
                    <Eye size={16}/> Details
                  </button>
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
