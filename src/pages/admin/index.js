// src/pages/admin/index.js
import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import CreateSectionModal from '../../components/section/create';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { 
  Users, Search, FileDown, Eye, LayoutDashboard, Loader2, Plus, 
  Megaphone, Send, Clock, ChevronRight, Paperclip, X, FileText, 
  Image as ImageIcon, Filter, GraduationCap, Layers, Activity, Calendar // Added Activity here
} from 'lucide-react';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const sectionCodes = sectionData.map(s => s.section_code);
        
        if (sectionCodes.length > 0) {
          const { data: studentData, error: studError } = await supabase
            .from('profiles')
            .select('*')
            .in('section_code', sectionCodes)
            .eq('role', 'student');

          if (!studError) setStudents(studentData || []);
        }
      }
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
      alert("Broadcast sent successfully!"); setAnnouncement(""); setFile(null);
    } catch (err) { alert("Error: " + err.message); } finally { setIsPosting(false); }
  };

  return (
    <RoleGuard allowedRole="instructor">
      <div className="max-w-[1600px] mx-auto animate-entrance space-y-8 p-4 md:p-8">
        
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-fbNavy p-2.5 rounded-xl shadow-lg shadow-fbNavy/10">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-black text-fbNavy uppercase italic tracking-tight">
                Faculty <span className="text-fbOrange underline decoration-4 underline-offset-4">Portal</span>
              </h1>
            </div>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
              <Activity className="w-3 h-3 text-fbOrange" /> System Status: Operational
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
             <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 lg:flex-none bg-fbNavy text-white font-black px-6 py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-fbOrange transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
              Create New Section
            </button>
          </div>
        </header>

        {/* BENTO GRID TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* BROADCAST BOX */}
          <div className="lg:col-span-8 bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Send size={120} className="-rotate-12 text-fbNavy" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-fbOrange/10 p-2.5 rounded-xl text-fbOrange"><Megaphone size={20} /></div>
                  <h2 className="font-black text-fbNavy uppercase italic text-sm tracking-widest">Global Broadcast</h2>
                </div>
                <div className="flex items-center gap-2 bg-fbGray/10 p-1.5 rounded-2xl">
                  <span className="text-[9px] font-black text-gray-400 uppercase px-2">Target:</span>
                  <select 
                    value={targetSection} 
                    onChange={(e) => setTargetSection(e.target.value)} 
                    className="bg-white border-none rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-fbNavy shadow-sm outline-none focus:ring-2 focus:ring-fbOrange/20 cursor-pointer"
                  >
                    <option value="all">All Enrolled</option>
                    {sections.map(sec => <option key={sec.id} value={sec.section_code}>{sec.section_code}</option>)}
                  </select>
                </div>
              </div>

              <textarea 
                value={announcement} 
                onChange={(e) => setAnnouncement(e.target.value)} 
                placeholder="Type your announcement here..." 
                className="w-full bg-fbGray/5 rounded-[30px] p-8 text-sm font-bold text-fbNavy outline-none focus:ring-2 focus:ring-fbOrange/20 min-h-[160px] transition-all border border-transparent focus:border-fbOrange/10 placeholder:text-gray-300" 
              />
              
              {file && (
                <div className="mt-4 flex items-center justify-between bg-fbOrange/5 p-4 rounded-2xl border border-fbOrange/10 animate-entrance">
                  <div className="flex items-center gap-3">
                    {file.type.includes('image') ? <ImageIcon className="text-fbOrange" size={20} /> : <FileText className="text-fbNavy" size={20} />}
                    <span className="text-[10px] font-black text-fbNavy truncate max-w-[300px] uppercase">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 hover:bg-fbOrange/20 rounded-full text-fbOrange transition-colors"><X size={16} /></button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-8 relative z-10">
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" accept=".jpg,.png,.pdf,.docx,.xlsx,.xls" />
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="p-4 rounded-2xl bg-fbNavy text-white hover:bg-fbOrange transition-all shadow-lg shadow-fbNavy/20 group"
                >
                  <Paperclip size={20} className="group-hover:-rotate-12 transition-transform" />
                </button>
                <div className="hidden sm:block">
                   <p className="text-[10px] font-black text-fbNavy uppercase tracking-widest leading-none">Attachment</p>
                   <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">PDF, Images, or Sheets</p>
                </div>
              </div>
              
              <button 
                onClick={handlePostAnnouncement} 
                disabled={isPosting} 
                className="bg-fbOrange text-white px-10 py-4 rounded-2xl hover:bg-fbNavy transition-all shadow-xl shadow-fbOrange/20 active:scale-95 flex items-center gap-3 disabled:bg-gray-300"
              >
                {isPosting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span className="text-xs font-black uppercase tracking-[0.2em]">{isPosting ? 'Broadcasting...' : 'Publish'}</span>
              </button>
            </div>
          </div>

          {/* STATS & SECTIONS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-fbNavy p-8 rounded-[40px] shadow-xl flex items-center gap-6 relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users size={120} className="text-white" />
              </div>
              <div className="bg-white/10 p-4 rounded-2xl text-fbOrange backdrop-blur-md border border-white/10">
                <GraduationCap size={32} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-fbGray/50 uppercase tracking-widest">Total Students</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter">{students.length}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Manage Sections</h2>
                <span className="bg-fbOrange/10 text-fbOrange text-[9px] font-black px-2 py-0.5 rounded-md">{sections.length} Total</span>
              </div>
              
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {sections.length > 0 ? sections.map((sec) => (
                  <div key={sec.id} className="bg-white p-5 rounded-[25px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-fbOrange/20 transition-all group cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-fbGray/10 p-2.5 rounded-xl group-hover:bg-fbOrange group-hover:text-white transition-all">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-fbNavy italic uppercase text-xs tracking-wide">{sec.section_code}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1 mt-1">
                          <Clock size={10} className="text-fbOrange" /> {sec.schedule || "TBA"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-200 group-hover:text-fbOrange group-hover:translate-x-1 transition-all" />
                  </div>
                )) : (
                  <div className="bg-white p-12 rounded-[30px] border border-dashed border-gray-200 text-center flex flex-col items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-full text-gray-300"><Clock size={24} /></div>
                    <p className="text-[10px] font-black text-gray-300 uppercase italic">Waiting for Sections...</p>
                  </div>
                )}
              </div>
              
              <div className="bg-fbGray/5 p-4 rounded-[25px] border border-gray-100 text-center">
                <p className="text-[9px] font-black text-fbNavy uppercase italic tracking-widest opacity-40 flex items-center justify-center gap-2">
                  <Calendar size={12} /> Semester Week 08/18
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT REGISTRY */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
            <div>
              <h2 className="text-lg font-black text-fbNavy uppercase italic tracking-tight">Student <span className="text-fbOrange">Registry</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database of all enrolled practitioners</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by ID or Name..." 
                  className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 text-[11px] font-black text-fbNavy uppercase focus:ring-4 focus:ring-fbOrange/5 outline-none w-full shadow-sm transition-all" 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button 
                onClick={handleExport} 
                className="p-4 bg-fbNavy text-white rounded-2xl hover:bg-fbOrange transition-all shadow-lg active:scale-95 group"
              >
                <FileDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-fbGray/5">
                    <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Practitioner</th>
                    <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Verification</th>
                    <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Assignment</th>
                    <th className="p-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="p-32 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-fbOrange opacity-20" />
                            <LayoutDashboard className="w-6 h-6 text-fbNavy absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <p className="text-fbNavy font-black italic uppercase tracking-[0.3em] text-[11px] animate-pulse">Syncing Database Records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-fbGray/5 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-fbGray/10 overflow-hidden border-2 border-white shadow-md transition-transform group-hover:scale-110">
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-fbNavy text-white font-black italic text-sm">
                                {s.full_name?.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="block text-sm font-black text-fbNavy uppercase italic tracking-tight group-hover:text-fbOrange transition-colors">
                              {s.full_name || "Guest Practitioner"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Registered Member</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-black text-fbNavy uppercase tracking-tight">{s.course || "General"}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-fbOrange animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{s.student_id || "ID-PENDING"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="inline-flex items-center gap-2 bg-fbNavy text-white px-4 py-1.5 rounded-xl text-[10px] font-black italic uppercase shadow-md shadow-fbNavy/10 group-hover:bg-fbOrange transition-colors">
                          <Filter size={10} /> {s.section_code || "UNLINKED"}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <button className="bg-fbGray/10 text-fbNavy font-black text-[10px] px-6 py-3 rounded-2xl uppercase tracking-widest hover:bg-fbNavy hover:text-white transition-all shadow-sm flex items-center gap-3 ml-auto group/btn">
                          <Eye className="w-3.5 h-3.5 text-fbOrange group-hover/btn:text-white" /> View Metrics
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <CreateSectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchData} 
      />
    </RoleGuard>
  );
}
