// src/pages/admin/index.js
import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { 
  Users, Search, FileDown, Eye, LayoutDashboard, Loader2, Plus, 
  Megaphone, Send, Clock, ChevronRight, Paperclip, X, FileText, 
  Image as ImageIcon, Filter, GraduationCap, Layers, Activity, Calendar,
  MoreHorizontal, MessageSquare, Share2, Globe, Sparkles, Zap
} from 'lucide-react';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]); 
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

      const { data: sectionData, error: secError } = await supabase
        .from('sections')
        .select('*')
        .eq('instructor_id', user.id);

      if (!secError && sectionData) {
        setSections(sectionData);
        const sectionCodes = sectionData.map(s => s.section_code.trim());
        
        if (sectionCodes.length > 0) {
          const { data: studentData, error: studError } = await supabase
            .from('profiles')
            .select('*')
            .in('section_code', sectionCodes)
            .eq('Role', 'student');

          if (!studError) setStudents(studentData || []);
        }
      }

      const { data: feedData } = await supabase
        .from('announcements')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (feedData) setAnnouncements(feedData);

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredStudents = students.filter(s => 
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const data = filteredStudents.map(s => ({ 
      StudentID: s.student_id, 
      FullName: s.full_name, 
      Course: s.course, 
      Section: s.section_code 
    }));
    downloadCSV(data, `PATHFit_Student_List`);
  };

  const handlePostAnnouncement = async () => {
    if (!announcement.trim() && !file) return;
    setIsPosting(true);
    try {
      let fileUrl = null, fileType = null;
      if (file) {
        const ext = file.name.split('.').pop(), name = `${Math.random()}.${ext}`;
        const { error: uErr } = await supabase.storage.from('announcement-attachments').upload(name, file);
        if (uErr) throw uErr;
        fileUrl = supabase.storage.from('announcement-attachments').getPublicUrl(name).publicUrl;
        fileType = ext;
      }
      const { error } = await supabase.from('announcements').insert([{ 
        content: announcement, 
        target_section: targetSection === 'all' ? null : targetSection, 
        is_global: targetSection === 'all', 
        instructor_id: (await supabase.auth.getUser()).data.user?.id, 
        file_url: fileUrl, 
        file_type: fileType 
      }]);
      if (error) throw error;
      setAnnouncement(""); setFile(null); fetchData();
    } catch (err) { alert("Error: " + err.message); } finally { setIsPosting(false); }
  };

  return (
    <RoleGuard allowedRole="instructor">
      <div className="max-w-[1440px] mx-auto animate-entrance space-y-8 p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans">
        
        {/* --- ENHANCED HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl shadow-fbNavy/5 border border-white">
          <div className="flex items-center gap-6">
            <div className="bg-fbNavy p-4 rounded-3xl shadow-2xl shadow-fbNavy/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-fbNavy tracking-tight italic uppercase leading-none">
                Faculty <span className="text-fbOrange">Hub</span>
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Cloud Sync Active
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-fbNavy text-white font-black px-10 py-5 rounded-[24px] text-[12px] uppercase tracking-widest hover:bg-fbOrange transition-all flex items-center justify-center gap-3 shadow-2xl shadow-fbNavy/20 active:scale-95 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Create Section
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT COLUMN: STATS & SECTION LIST --- */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-fbNavy to-[#1a2a4a] p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-fbOrange/20 transition-colors duration-700" />
              <Users className="absolute -right-4 -bottom-4 text-white opacity-5 w-40 h-40 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <p className="text-[12px] font-black text-fbGray/40 uppercase tracking-[0.3em] mb-2">Active Population</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-7xl font-black text-white italic tracking-tighter">{students.length}</h3>
                  <span className="text-fbOrange font-bold uppercase text-xs">Students</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[12px] font-black text-fbNavy uppercase tracking-widest flex items-center gap-3">
                  <div className="p-2 bg-fbOrange/10 rounded-lg"><Layers className="w-4 h-4 text-fbOrange" /></div> 
                  Your Sections
                </h2>
                <span className="text-[11px] font-black text-fbNavy bg-[#f0f2f5] px-4 py-2 rounded-2xl">{sections.length} Units</span>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sections.map((sec) => (
                  <div key={sec.id} className="p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-fbOrange/20 hover:bg-white hover:shadow-xl transition-all group flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-fbNavy group-hover:text-white transition-colors font-black text-xs uppercase italic">
                        {sec.section_code.substring(0,2)}
                      </div>
                      <div>
                        <h4 className="font-black text-fbNavy text-sm uppercase tracking-wider">{sec.section_code}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mt-1">
                          <Clock size={12} className="text-fbOrange" /> {sec.schedule || "Not Set"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-fbOrange group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- MIDDLE COLUMN: ENHANCED FEED --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* POST COMPOSER */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-fbNavy/5 border border-white">
              <div className="flex gap-5 mb-6">
                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-fbNavy to-blue-900 flex-shrink-0 flex items-center justify-center text-white font-black text-lg border-4 border-white shadow-xl shadow-fbNavy/20">
                  <Zap size={24} className="fill-fbOrange text-fbOrange" />
                </div>
                <div className="flex-1">
                   <textarea 
                    value={announcement} 
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="Broadcast an update to your students..." 
                    className="w-full bg-[#f8fafc] rounded-[28px] p-6 text-[15px] font-medium text-fbNavy outline-none border-2 border-transparent focus:border-fbOrange/20 focus:bg-white transition-all resize-none min-h-[140px] shadow-inner"
                  />
                </div>
              </div>

              {file && (
                <div className="mb-6 bg-fbOrange/10 p-4 rounded-[24px] border border-fbOrange/20 flex items-center justify-between animate-entrance">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-fbOrange"><Paperclip size={18} /></div>
                    <span className="text-[11px] font-black text-fbNavy uppercase tracking-wider truncate max-w-[300px]">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 hover:bg-white rounded-full transition-colors text-fbOrange"><X size={20} /></button>
                </div>
              )}

              <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-[20px] transition-all text-slate-600 font-black text-[11px] uppercase tracking-[0.1em]">
                    <ImageIcon size={20} className="text-emerald-500" /> Attachment
                  </button>
                  <div className="relative group">
                    <select 
                      value={targetSection} 
                      onChange={(e) => setTargetSection(e.target.value)}
                      className="appearance-none bg-slate-50 border-none text-[11px] font-black uppercase tracking-[0.1em] rounded-[20px] pl-10 pr-10 py-3 outline-none cursor-pointer hover:bg-slate-100 transition-all text-slate-600"
                    >
                      <option value="all">Global Broadcast</option>
                      {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                    </select>
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fbOrange" />
                  </div>
                </div>
                <button 
                  onClick={handlePostAnnouncement}
                  disabled={isPosting}
                  className="bg-fbOrange text-white px-10 py-4 rounded-[20px] font-black text-[12px] uppercase tracking-widest hover:bg-fbNavy transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-fbOrange/20 hover:scale-105 active:scale-95"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />} Dispatch Post
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              </div>
            </div>

            {/* FEED ITEMS */}
            <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 pb-10 custom-scrollbar">
              {announcements.map((post) => (
                <div key={post.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 animate-entrance hover:shadow-lg transition-shadow duration-500">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#f0f2f5] flex items-center justify-center text-fbNavy border border-white shadow-sm">
                        <Megaphone size={22} className="text-fbNavy/30" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-fbNavy uppercase tracking-tight italic flex items-center gap-2">
                          {post.target_section ? `Section ${post.target_section}` : 'Global Announcement'}
                          {!post.target_section && <span className="bg-fbOrange/10 text-fbOrange text-[9px] px-2 py-0.5 rounded-full not-italic">Public</span>}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest mt-1">
                          <Calendar size={12} className="text-fbOrange" /> {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><MoreHorizontal className="text-slate-300" size={20} /></button>
                  </div>
                  
                  <p className="text-[15px] font-medium text-slate-700 leading-relaxed mb-6 bg-[#fcfdfe] p-4 rounded-2xl italic border-l-4 border-fbOrange/20">
                    "{post.content}"
                  </p>
                  
                  {post.file_url && (
                    <div className="group relative rounded-[32px] overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 p-6 mb-6 transition-all hover:border-fbOrange/40 hover:bg-white">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-fbNavy rounded-2xl text-white shadow-lg"><FileText size={24} /></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Attachment</p>
                          <a href={post.file_url} target="_blank" className="text-xs font-black text-fbNavy hover:text-fbOrange uppercase underline decoration-2 underline-offset-4">Open Resource Portal</a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-50 flex items-center gap-8">
                    <button className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-fbNavy transition-colors">
                      <MessageSquare size={16} /> <span className="hidden sm:inline">Discussion</span>
                    </button>
                    <button className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-fbOrange transition-colors">
                      <Share2 size={16} /> <span className="hidden sm:inline">Forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- ENHANCED STUDENT REGISTRY --- */}
        <div className="space-y-8 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-8 bg-fbOrange" />
                <span className="text-[11px] font-black text-fbOrange uppercase tracking-[0.4em]">Directory Control</span>
              </div>
              <h2 className="text-4xl font-black text-fbNavy italic uppercase tracking-tighter">Student <span className="text-fbOrange">Registry</span></h2>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-[400px] group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-fbOrange transition-colors" />
                <input 
                  type="text" 
                  placeholder="ID Number or Full Name..." 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[28px] text-[12px] font-black text-fbNavy uppercase focus:ring-8 focus:ring-fbNavy/5 focus:border-fbNavy outline-none transition-all shadow-xl shadow-fbNavy/5"
                />
              </div>
              <button onClick={handleExport} className="p-5 bg-fbNavy text-white rounded-[24px] hover:bg-fbOrange transition-all shadow-xl shadow-fbNavy/20 hover:-translate-y-1 active:scale-95">
                <FileDown size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2">
            {filteredStudents.map((s) => (
              <div key={s.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fbGray/5 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:bg-fbOrange/5 transition-colors duration-500" />
                
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex-shrink-0 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-fbNavy flex items-center justify-center text-white font-black text-2xl italic tracking-tighter">
                        {s.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-fbNavy uppercase italic text-lg tracking-tighter group-hover:text-fbOrange transition-colors leading-tight">
                      {s.full_name || "New Student"}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                       <GraduationCap size={14} className="text-fbOrange" />
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.course || "General Pathfit"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between bg-slate-50/50 p-6 rounded-[32px] border border-slate-50">
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest text-center">Section</span>
                    <div className="inline-flex items-center gap-2 bg-fbNavy text-white px-6 py-2 rounded-2xl text-[11px] font-black italic uppercase shadow-lg shadow-fbNavy/20">
                       {s.section_code || "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-widest">Identification</span>
                    <p className="text-sm font-black text-fbNavy tracking-widest">{s.student_id || "PENDING"}</p>
                  </div>
                </div>

                <button className="w-full mt-8 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-[11px] font-black text-fbNavy uppercase tracking-[0.25em] group-hover:bg-fbNavy group-hover:text-white group-hover:border-fbNavy transition-all flex items-center justify-center gap-3 shadow-sm">
                  <Eye size={18} className="text-fbOrange" /> View Full Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <CreateSectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
    </RoleGuard>
  );
}
