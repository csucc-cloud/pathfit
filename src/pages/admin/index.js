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
  Trophy, TrendingUp, Bell, Activity, Cpu, Zap
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
      {/* MESH GRADIENT BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[#F4F7FE] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-fbOrange/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fbNavy/5 blur-[120px]" />
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen p-4 md:p-6 lg:p-10 font-sans text-slate-900 max-w-[1600px] mx-auto">
        
        {/* --- TOP BAR (RESPONSIVE) --- */}
        <motion.nav variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-fbNavy uppercase tracking-tighter flex items-center gap-3">
              <Zap className="text-fbOrange fill-fbOrange animate-pulse" />
              FACULTY <span className="text-fbOrange">NODE</span>
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Operational Status: Optimal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-2 rounded-3xl border border-white shadow-xl">
            <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-fbNavy flex items-center justify-center text-white font-bold overflow-hidden shadow-lg transform rotate-3">
                 {instructorProfile?.avatar_url ? <img src={instructorProfile.avatar_url} className="object-cover w-full h-full" /> : instructorProfile?.full_name?.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-[12px] font-black text-fbNavy leading-none uppercase italic">{instructorProfile?.full_name || 'Instructor'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Authorized Personnel</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-fbOrange transition-all"><Bell size={20}/></button>
          </div>
        </motion.nav>

        {/* --- BENTO SYSTEM DIAGNOSTICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Network Population', val: students.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Cluster Segments', val: sections.length, icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Data Broadcasts', val: announcements.length, icon: Send, color: 'text-fbOrange', bg: 'bg-fbOrange/10' },
            { label: 'Sync Velocity', val: '98.2%', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm flex flex-col justify-between relative overflow-hidden">
               {/* SVG Micro-interaction Background */}
               <svg className="absolute right-[-10px] bottom-[-10px] opacity-5 w-24 h-24" viewBox="0 0 100 100">
                  <path d="M10 50 Q 25 25 50 50 T 90 50" fill="none" stroke="currentColor" strokeWidth="2" className={stat.color} />
               </svg>
               
               <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                 <stat.icon size={22}/>
               </div>
               <div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-3xl font-black text-fbNavy mt-1 italic">{stat.val}</h3>
               </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --- LEFT: BROADCAST & FEED --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* POST BOX (BENTO STYLE) */}
            <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-6 md:p-8 shadow-xl border border-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={80} className="text-fbNavy" />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-fbNavy rounded-2xl text-white shadow-lg shadow-fbNavy/20"><MessageSquare size={20}/></div>
                   <h2 className="text-sm font-black text-fbNavy uppercase italic">Data Uplink</h2>
                </div>
                <div className="relative w-full sm:w-auto">
                    <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} className="w-full sm:w-auto appearance-none bg-slate-50 rounded-2xl pl-10 pr-10 py-3 outline-none cursor-pointer font-black text-[10px] uppercase text-fbNavy border border-slate-100 focus:ring-2 ring-fbOrange/20 transition-all">
                      <option value="all">Broadcast: Global</option>
                      {sections.map(s => <option key={s.id} value={s.section_code}>Channel: {s.section_code}</option>)}
                    </select>
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-fbOrange" />
                </div>
              </div>
              
              <textarea 
                value={announcement} 
                onChange={(e) => setAnnouncement(e.target.value)} 
                placeholder={`Initialize broadcast sequence...`} 
                className="w-full bg-slate-50/50 rounded-[32px] p-6 text-sm font-medium text-fbNavy outline-none focus:bg-white transition-all resize-none min-h-[120px] border border-slate-100 focus:border-fbOrange/30 shadow-inner" 
              />

              <AnimatePresence>
                {file && (
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="mt-4 bg-fbNavy text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl border-l-4 border-fbOrange">
                    <div className="flex items-center gap-3"><FileText size={18} className="text-fbOrange"/><span className="text-[10px] font-bold uppercase truncate max-w-[200px]">{file.name}</span></div>
                    <button onClick={() => setFile(null)} className="hover:rotate-90 transition-transform"><X size={18}/></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                <button onClick={() => fileInputRef.current.click()} className="w-full sm:w-auto p-4 bg-slate-100/50 hover:bg-fbNavy hover:text-white transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase">
                  <ImageIcon size={18} className="text-fbOrange"/> Attach Resource
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePostAnnouncement} 
                  disabled={isPosting} 
                  className="w-full sm:w-auto bg-fbOrange text-white px-10 py-4 rounded-2xl font-black text-[12px] uppercase shadow-xl shadow-fbOrange/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isPosting ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Transmit
                </motion.button>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            </motion.div>

            {/* FEED */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4 py-2 bg-fbNavy/5 rounded-2xl">
                <div className="flex items-center gap-2">
                   <Activity size={14} className="text-fbNavy" />
                   <h3 className="text-[10px] font-black text-fbNavy uppercase tracking-[0.3em]">Temporal Logs</h3>
                </div>
                <div className="h-[1px] flex-1 mx-4 bg-fbNavy/10 hidden md:block" />
                <button className="text-[9px] font-black text-fbOrange uppercase hover:tracking-widest transition-all">Audit Archive</button>
              </div>

              <AnimatePresence mode='popLayout'>
                {announcements.map((post) => (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={post.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 hover:shadow-xl transition-all border-l-4 border-l-fbNavy">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                           {instructorProfile?.avatar_url ? <img src={instructorProfile.avatar_url} className="object-cover w-full h-full" /> : <ShieldCheck size={18} className="text-fbNavy"/>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[12px] font-black text-fbNavy uppercase italic leading-none">{instructorProfile?.full_name}</h4>
                            <div className="px-2 py-0.5 bg-fbOrange/10 text-fbOrange rounded-md text-[8px] font-bold">VERIFIED</div>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                            {post.target_section ? `Seg: ${post.target_section}` : 'GLOBAL BROADCAST'} • {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal size={18} className="text-slate-300"/>
                    </div>
                    
                    <p className="text-[14px] font-medium text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                    
                    {post.file_url && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                          <FileText size={16} className="text-fbNavy shrink-0"/>
                          <span className="text-[9px] font-black text-fbNavy uppercase truncate">Payload Detected</span>
                        </div>
                        <a href={post.file_url} target="_blank" className="text-fbOrange font-black text-[9px] uppercase hover:underline">Access</a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* --- RIGHT: SYSTEM DIAGNOSTICS & SECTIONS --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* SYSTEM DIAGNOSTICS (REPLACED REGISTRY FINDER) */}
            <motion.div variants={itemVariants} className="bg-fbNavy p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-fbOrange/20 rounded-full blur-2xl group-hover:bg-fbOrange/40 transition-colors" />
              
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="text-fbOrange" size={24}/>
                <h3 className="text-xs font-black uppercase tracking-widest italic">System Diagnostics</h3>
              </div>

              <div className="space-y-4 mb-6">
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="SCAN ID / NAME..." 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-black uppercase placeholder:text-white/30 outline-none focus:ring-2 ring-fbOrange/50 transition-all" 
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fbOrange" size={16}/>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <p className="text-[8px] font-bold text-fbOrange uppercase">CPU Load</p>
                       <p className="text-xs font-black italic">LOW</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                       <p className="text-[8px] font-bold text-fbOrange uppercase">Mem Sync</p>
                       <p className="text-xs font-black italic">STABLE</p>
                    </div>
                 </div>
              </div>

              <button onClick={handleExport} className="w-full py-4 bg-fbOrange text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-xl hover:translate-y-[-2px] transition-all">
                <FileDown size={16}/> Extract Core Data
              </button>
            </motion.div>

            {/* SECTIONS (BENTO STYLE) */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-fbNavy uppercase italic">Active Nodes</h3>
                <motion.button 
                  whileHover={{ rotate: 90 }}
                  onClick={() => setIsModalOpen(true)} 
                  className="p-3 bg-fbNavy text-white rounded-xl shadow-lg"
                >
                  <Plus size={16}/>
                </motion.button>
              </div>
              <div className="space-y-3">
                {sections.map(sec => (
                  <div key={sec.id} className="p-4 rounded-2xl bg-slate-50 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-fbNavy text-white flex items-center justify-center font-black text-[10px] uppercase italic">{sec.section_code.substring(0,2)}</div>
                      <div>
                        <p className="text-[11px] font-black text-fbNavy uppercase leading-none tracking-tighter">{sec.section_code}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">{sec.schedule || 'PENDING SYNC'}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-fbOrange" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- DYNAMIC STUDENT GRID (SYSTEM ENTITIES) --- */}
        <motion.section variants={itemVariants} className="mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
             <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-fbNavy uppercase tracking-tighter italic">Entity <span className="text-fbOrange">Registry</span></h2>
                <div className="h-1.5 w-24 bg-fbNavy mt-2 rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-fbOrange w-1/2 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, #FF8C00, transparent)', backgroundSize: '200% 100%' }} />
                </div>
             </div>
             <div className="px-4 py-2 bg-white rounded-full border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Displaying {filteredStudents.length} Active Records
             </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredStudents.map((s) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={s.id} className="bg-white/70 backdrop-blur-md p-8 rounded-[48px] border border-white shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-[32px] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group-hover:rotate-6 transition-transform">
                        {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-fbNavy flex items-center justify-center text-white font-black text-3xl italic">{s.full_name?.charAt(0)}</div>}
                      </div>
                      <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-50 scale-0 group-hover:scale-100 transition-transform">
                        <ShieldCheck className="text-emerald-500" size={16}/>
                      </div>
                    </div>
                    
                    <h4 className="font-black text-fbNavy uppercase italic text-lg leading-tight tracking-tighter group-hover:text-fbOrange transition-colors">{s.full_name || "UNIDENTIFIED"}</h4>
                    <p className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-[0.3em]">{s.student_id || "ID_PENDING"}</p>
                  </div>
                  
                  <div className="mt-8 flex gap-2">
                    <div className="flex-1 bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 text-center">
                      <span className="text-[8px] font-black text-slate-300 uppercase block mb-1 tracking-widest">Seg. Code</span>
                      <span className="text-[11px] font-black text-fbNavy uppercase italic">{s.section_code || "N/A"}</span>
                    </div>
                    <div className="flex-1 bg-slate-50/50 p-4 rounded-[24px] border border-slate-100 text-center">
                      <span className="text-[8px] font-black text-slate-300 uppercase block mb-1 tracking-widest">Class</span>
                      <span className="text-[11px] font-black text-fbOrange uppercase italic">P.FIT</span>
                    </div>
                  </div>

                  <button className="w-full mt-6 py-5 bg-fbNavy text-white rounded-[24px] text-[10px] font-black uppercase hover:bg-fbOrange transition-all flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg shadow-fbNavy/10">
                    <Eye size={16}/> Analyze Profile
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
