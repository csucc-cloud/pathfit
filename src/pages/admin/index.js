// src/pages/admin/index.js
import React, { useState, useEffect, useRef } from 'react';
import RoleGuard from '../../components/RoleGuard';
import { useAdminData } from '../../hooks/useAdminData';
import { supabase } from '../../lib/supabaseClient'; 
import { downloadCSV } from '../../utils/exportHelper'; 
import { Users, Search, FileDown, Eye, LayoutDashboard, Loader2, Calendar, User, Plus, Activity, Award, Megaphone, Send, Clock, ChevronRight, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [pId, setPId] = useState(1);
  const { students, loading } = useAdminData(pId);
  const [searchTerm, setSearchTerm] = useState(""), [announcement, setAnnouncement] = useState(""), [targetSection, setTargetSection] = useState("all"), [sections, setSections] = useState([]), [isPosting, setIsPosting] = useState(false), [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { async function f() { const { data, error } = await supabase.from('sections').select('*'); if (!error && data) setSections(data); } f(); }, []);

  const filteredStudents = students.filter(s => s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) || s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleExport = () => {
    const data = filteredStudents.map(s => ({ StudentID: s.student_id, FullName: s.full_name, ExercisesCompleted: s.exercises, Progress: `${Math.round((s.exercises / 15) * 100)}%`, LastActive: new Date(s.lastActive).toLocaleDateString() }));
    downloadCSV(data, `PATHFit_Practicum_${pId}_Grades`);
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
      const { error } = await supabase.from('announcements').insert([{ content: announcement, target_section: targetSection === 'all' ? null : targetSection, is_global: targetSection === 'all', instructor_id: (await supabase.auth.getUser()).data.user?.id, file_url: fileUrl, file_type: fileType }]);
      if (error) throw error;
      alert("Broadcast sent successfully!"); setAnnouncement(""); setFile(null);
    } catch (err) { alert("Error: " + err.message); } finally { setIsPosting(false); }
  };

  return (
    <RoleGuard allowedRole="instructor">
      <div className="animate-entrance space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-fbOrange p-2 rounded-lg shadow-lg shadow-fbOrange/20"><LayoutDashboard className="w-5 h-5 text-white" /></div>
              <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter">Faculty <span className="text-fbOrange">Overview</span></h1>
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 ml-1"><Megaphone className="w-3 h-3 text-fbOrange" /> Announcements & Section Hub</p>
          </div>
          <button className="bg-fbNavy text-white font-black px-6 py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-fbOrange transition-all flex items-center gap-3 shadow-xl active:scale-95"><Plus className="w-4 h-4" /> Create New Section</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden relative">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3"><div className="bg-fbGray/20 p-2 rounded-xl text-fbNavy"><Megaphone size={18} /></div><h2 className="font-black text-fbNavy uppercase italic text-sm tracking-widest">Broadcast Announcement</h2></div>
                <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} className="bg-fbGray/10 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-fbNavy outline-none focus:ring-2 focus:ring-fbOrange/20 cursor-pointer">
                  <option value="all">Broadcast to All</option>
                  {sections.map(sec => <option key={sec.id} value={sec.section_code}>{sec.section_code}</option>)}
                </select>
              </div>
              <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Message your students..." className="w-full bg-fbGray/10 rounded-[25px] p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-fbOrange/20 min-h-[120px] transition-all" />
              {file && <div className="mt-4 flex items-center justify-between bg-fbGray/10 p-3 rounded-2xl border border-fbOrange/20 animate-entrance">
                <div className="flex items-center gap-3">{file.type.includes('image') ? <ImageIcon className="text-fbOrange" size={18} /> : <FileText className="text-fbNavy" size={18} />}<span className="text-[10px] font-bold text-fbNavy truncate max-w-[200px]">{file.name}</span></div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>}
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" accept=".jpg,.png,.pdf,.docx,.xlsx,.xls" />
                <button onClick={() => fileInputRef.current.click()} className="p-4 rounded-2xl bg-fbGray/10 text-fbNavy hover:bg-fbOrange/10 hover:text-fbOrange transition-all"><Paperclip size={20} /></button>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">Attach Photos, PDF, Excel, or Word</p>
              </div>
              <button onClick={handlePostAnnouncement} disabled={isPosting} className="bg-fbNavy text-white px-8 py-4 rounded-2xl hover:bg-fbOrange transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:bg-gray-400">
                {isPosting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}<span className="text-xs font-black uppercase tracking-widest">{isPosting ? 'Sending...' : 'Send Broadcast'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Active Sections</h2>
            {sections.length > 0 ? sections.map((sec) => (
              <div key={sec.id} className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-2"><h4 className="font-black text-fbNavy italic uppercase text-sm group-hover:text-fbOrange transition-colors">{sec.section_code}</h4><ChevronRight size={16} className="text-gray-200 group-hover:text-fbOrange group-hover:translate-x-1 transition-all" /></div>
                <div className="flex items-center justify-between"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1"><Clock size={12} className="text-fbOrange" /> {sec.schedule || "TBA"}</p><div className="flex items-center gap-1.5"><Users size={12} className="text-fbNavy" /><span className="text-[10px] font-black text-fbNavy italic">ACTIVE</span></div></div>
              </div>
            )) : <div className="bg-white p-8 rounded-[30px] border border-dashed border-gray-200 text-center"><p className="text-[9px] font-bold text-gray-300 uppercase">No sections found</p></div>}
            <div className="bg-fbGray/10 p-4 rounded-[25px] border border-dashed border-gray-200 text-center"><p className="text-[9px] font-black text-gray-400 uppercase italic">Semester Week 08/18</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-fbOrange/20 transition-all">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><Users size={28} /></div>
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p><h3 className="text-3xl font-black text-fbNavy italic">{students.length}</h3></div>
          </div>
          <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-fbOrange/20 transition-all">
            <div className="bg-fbOrange/10 p-4 rounded-2xl text-fbOrange group-hover:scale-110 transition-transform"><Activity size={28} /></div>
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Score</p><h3 className="text-3xl font-black text-fbNavy italic">84.2</h3></div>
          </div>
          <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-fbOrange/20 transition-all">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600 group-hover:scale-110 transition-transform"><Award size={28} /></div>
            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Practicum</p><h3 className="text-3xl font-black text-fbNavy italic">P-{pId}</h3></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2">Master Roster</h2>
            <div className="flex items-center gap-4">
              <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-fbOrange transition-colors" /><input type="text" placeholder="Search ID or Name..." className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-fbNavy focus:ring-4 focus:ring-fbOrange/5 outline-none w-72 shadow-sm transition-all" onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <button onClick={handleExport} className="p-4 bg-white border border-gray-100 rounded-2xl text-fbNavy hover:text-fbOrange transition-all shadow-sm"><FileDown size={20} /></button>
            </div>
          </div>
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-fbGray/5 border-b border-gray-100">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Student ID</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest"><div className="flex items-center gap-2"><User className="w-3 h-3 text-fbOrange" /> Name</div></th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Completion</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center"><div className="flex items-center justify-center gap-2"><Calendar className="w-3 h-3 text-fbOrange" /> Activity</div></th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="p-20 text-center"><div className="flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-fbOrange" /><p className="text-fbNavy font-black italic uppercase tracking-widest text-xs animate-pulse">Synchronizing Records...</p></div></td></tr>
                ) : filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-fbGray/10 transition-all group">
                    <td className="p-6 font-black text-xs text-fbNavy tracking-tighter">{s.student_id || "PENDING"}</td>
                    <td className="p-6"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-fbNavy text-white flex items-center justify-center text-[10px] font-black italic">{s.full_name?.substring(0,2).toUpperCase() || "??"}</div><span className="text-sm font-black text-fbNavy uppercase italic tracking-tight group-hover:text-fbOrange transition-colors">{s.full_name || "Unknown Student"}</span></div></td>
                    <td className="p-6"><div className="flex items-center gap-4"><div className="flex-1 h-2 bg-fbGray/30 rounded-full max-w-[120px] overflow-hidden"><div className="h-full bg-fbOrange rounded-full shadow-[0_0_12px_rgba(245,124,0,0.3)] transition-all duration-1000 ease-out" style={{ width: `${(s.exercises / 15) * 100}%` }}></div></div><span className="text-[10px] font-black text-fbNavy italic">{s.exercises}<span className="text-gray-300">/15</span></span></div></td>
                    <td className="p-6 text-center"><span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(s.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                    <td className="p-6 text-right"><button className="bg-white border border-gray-100 text-fbNavy font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-fbNavy hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto group/btn"><Eye className="w-3 h-3 text-fbOrange group-hover/btn:text-white" /> View Log</button></td>
                  </tr>
                ))}
                {!loading && filteredStudents.length === 0 && (
                  <tr><td colSpan="5" className="p-20 text-center"><div className="flex flex-col items-center gap-3 opacity-30"><Search className="w-12 h-12" /><p className="font-black italic uppercase tracking-[0.3em] text-xs">No matching records</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
