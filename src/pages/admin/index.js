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
  MoreHorizontal, MessageSquare, Share2, Globe
} from 'lucide-react';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]); // State for feed
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

      // Fetch existing announcements for the feed
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
        fileUrl = supabase.storage.from('announcement-attachments').getPublicUrl(name).data.publicUrl;
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
      alert("Broadcast sent successfully!"); setAnnouncement(""); setFile(null); fetchData();
    } catch (err) { alert("Error: " + err.message); } finally { setIsPosting(false); }
  };

  return (
    <RoleGuard allowedRole="instructor">
      <div className="max-w-[1400px] mx-auto animate-entrance space-y-6 p-4 md:p-6 bg-[#f0f2f5] min-h-screen">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-fbNavy p-3 rounded-2xl shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-fbNavy tracking-tight italic uppercase">
                Faculty <span className="text-fbOrange">Hub</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live System
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-fbNavy text-white font-black px-8 py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-fbOrange transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
          >
            <Plus className="w-4 h-4" /> Create Section
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: STATS & SECTION SCROLL */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <div className="bg-fbNavy p-6 rounded-[32px] shadow-xl relative overflow-hidden group">
              <Users className="absolute -right-4 -bottom-4 text-white opacity-10 w-32 h-32" />
              <p className="text-[10px] font-black text-fbGray/50 uppercase tracking-[0.2em] mb-1">Total Enrolled</p>
              <h3 className="text-5xl font-black text-white italic">{students.length}</h3>
            </div>

            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[11px] font-black text-fbNavy uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4 text-fbOrange" /> Section List
                </h2>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{sections.length}</span>
              </div>
              
              {/* SCROLLABLE SECTION LIST */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {sections.map((sec) => (
                  <div key={sec.id} className="p-4 rounded-2xl bg-fbGray/5 border border-transparent hover:border-fbOrange/20 hover:bg-white hover:shadow-md transition-all group flex items-center justify-between cursor-pointer">
                    <div>
                      <h4 className="font-black text-fbNavy text-xs uppercase tracking-wider">{sec.section_code}</h4>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase mt-1">
                        <Clock size={10} /> {sec.schedule || "No Schedule"}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-fbOrange group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: FB FEED */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ANNOUNCEMENT CARD (FB STYLE) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-fbNavy flex-shrink-0 flex items-center justify-center text-white font-black text-sm border-2 border-gray-50 shadow-md">
                  FC
                </div>
                <textarea 
                  value={announcement} 
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="What's on your mind for the students?" 
                  className="w-full bg-[#f0f2f5] rounded-2xl p-4 text-sm font-medium text-fbNavy outline-none border-none focus:ring-1 focus:ring-fbOrange/20 resize-none min-h-[100px]"
                />
              </div>

              {file && (
                <div className="mb-4 bg-fbOrange/5 p-3 rounded-xl border border-fbOrange/10 flex items-center justify-between animate-entrance">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-fbOrange" />
                    <span className="text-[10px] font-black text-fbNavy uppercase truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-fbOrange"><X size={14} /></button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                    <ImageIcon size={18} className="text-green-500" /> Photo/File
                  </button>
                  <select 
                    value={targetSection} 
                    onChange={(e) => setTargetSection(e.target.value)}
                    className="bg-gray-50 border-none text-[10px] font-black uppercase rounded-xl px-4 py-2 outline-none cursor-pointer"
                  >
                    <option value="all">Public Feed</option>
                    {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handlePostAnnouncement}
                  disabled={isPosting}
                  className="bg-fbOrange text-white px-8 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-fbNavy transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send size={14} />} Post
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              </div>
            </div>

            {/* SCROLLABLE FEED */}
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 pb-10 custom-scrollbar">
              {announcements.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 animate-entrance">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-fbGray/10 flex items-center justify-center text-fbNavy"><Globe size={20} /></div>
                      <div>
                        <h4 className="text-xs font-black text-fbNavy uppercase tracking-tight italic">
                          {post.target_section ? `Section ${post.target_section}` : 'General Update'}
                        </h4>
                        <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                          <Clock size={10} /> {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <MoreHorizontal className="text-gray-300" size={18} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  
                  {post.file_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 p-4 mb-4 flex items-center gap-3">
                      <FileText className="text-fbNavy" />
                      <a href={post.file_url} target="_blank" className="text-[10px] font-black text-fbNavy hover:text-fbOrange uppercase underline">View Attachment</a>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-50 flex items-center gap-6">
                    <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-fbOrange transition-colors">
                      <MessageSquare size={14} /> Comments
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-fbOrange transition-colors">
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STUDENT REGISTRY: CARD APPROACH */}
        <div className="space-y-6 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
            <div>
              <h2 className="text-2xl font-black text-fbNavy italic uppercase tracking-tighter">Student <span className="text-fbOrange">Registry</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Manage all enrolled practitioners</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter students..." 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-[11px] font-black text-fbNavy uppercase focus:ring-4 focus:ring-fbOrange/5 outline-none transition-all shadow-sm"
                />
              </div>
              <button onClick={handleExport} className="p-4 bg-fbNavy text-white rounded-2xl hover:bg-fbOrange transition-all shadow-lg">
                <FileDown size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-fbGray/5 rounded-bl-full -mr-4 -mt-4 z-0" />
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-fbNavy/5 flex-shrink-0 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-fbNavy font-black text-xl italic">{s.full_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-fbNavy uppercase italic text-sm tracking-tight group-hover:text-fbOrange transition-colors">
                      {s.full_name || "New Practitioner"}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{s.course || "General Course"}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6">
                  <div>
                    <span className="text-[9px] font-black text-gray-300 uppercase block mb-1">Section Code</span>
                    <div className="inline-flex items-center gap-2 bg-fbNavy text-white px-4 py-1.5 rounded-xl text-[10px] font-black italic uppercase">
                      <Filter size={10} /> {s.section_code || "PENDING"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-300 uppercase block mb-1">ID Number</span>
                    <p className="text-[11px] font-black text-fbNavy tracking-widest">{s.student_id || "N/A"}</p>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-fbGray/5 rounded-2xl text-[10px] font-black text-fbNavy uppercase tracking-[0.2em] group-hover:bg-fbNavy group-hover:text-white transition-all flex items-center justify-center gap-2">
                  <Eye size={14} className="text-fbOrange" /> View Full Profile
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
