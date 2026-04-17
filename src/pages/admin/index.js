// src/pages/admin/index.js
import React, { useState } from 'react';
// import InstructorLayout from '../../components/layouts/InstructorLayout'; // Remove this import
import RoleGuard from '../../components/RoleGuard';
import { useAdminData } from '../../hooks/useAdminData';
import { downloadCSV } from '../../utils/exportHelper'; 
import { 
  Users, 
  Search, 
  FileDown, 
  Eye, 
  LayoutDashboard, 
  Loader2,
  Calendar,
  User
} from 'lucide-react';

export default function AdminDashboard() {
  const [pId, setPId] = useState(1);
  const { students, loading } = useAdminData(pId);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(s => 
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredStudents.map(s => ({
      StudentID: s.student_id,
      FullName: s.full_name,
      ExercisesCompleted: s.exercises,
      Progress: `${Math.round((s.exercises / 15) * 100)}%`,
      LastActive: new Date(s.lastActive).toLocaleDateString(),
    }));
    downloadCSV(exportData, `PATHFit_Practicum_${pId}_Grades`);
  };

  return (
    <RoleGuard allowedRole="instructor">
      {/* REMOVED InstructorLayout wrapper here because it is now in _app.js */}
      <div className="animate-entrance">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-fbOrange p-2 rounded-lg shadow-lg shadow-fbOrange/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter">
                Instructor <span className="text-fbOrange">View</span>
              </h1>
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
              <Users className="w-3 h-3 text-fbOrange" /> Monitor Student Records
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-fbOrange transition-colors" />
              <input 
                type="text"
                placeholder="Search ID or Name..."
                className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-fbNavy focus:ring-4 focus:ring-fbOrange/5 outline-none w-72 shadow-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleExport}
                className="bg-fbNavy text-white font-black px-6 py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-fbOrange transition-all flex items-center gap-3 shadow-xl shadow-fbNavy/10 active:scale-95"
              >
                <FileDown className="w-4 h-4" />
                Export
              </button>

              <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPId(num)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      pId === num ? 'bg-fbGray text-fbNavy' : 'text-gray-300 hover:text-fbNavy hover:bg-fbGray/30'
                    }`}
                  >
                    Practicum {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-fbGray/5 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Student ID</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <div className="flex items-center gap-2"><User className="w-3 h-3 text-fbOrange" /> Name</div>
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Completion</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">
                   <div className="flex items-center justify-center gap-2"><Calendar className="w-3 h-3 text-fbOrange" /> Activity</div>
                </th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-fbOrange" />
                      <p className="text-fbNavy font-black italic uppercase tracking-widest text-xs animate-pulse">Synchronizing Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-fbGray/10 transition-all group">
                  <td className="p-6">
                    <span className="font-black text-xs text-fbNavy bg-fbGray/20 px-3 py-1.5 rounded-lg tracking-tighter">
                      {s.student_id || "PENDING"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-fbNavy text-white flex items-center justify-center text-[10px] font-black italic">
                        {s.full_name?.substring(0,2).toUpperCase() || "??"}
                      </div>
                      <span className="text-sm font-black text-fbNavy uppercase italic tracking-tight group-hover:text-fbOrange transition-colors">
                        {s.full_name || "Unknown Student"}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-fbGray/30 rounded-full max-w-[120px] overflow-hidden">
                        <div 
                          className="h-full bg-fbOrange rounded-full shadow-[0_0_12px_rgba(245,124,0,0.3)] transition-all duration-1000 ease-out" 
                          style={{ width: `${(s.exercises / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-fbNavy italic">{s.exercises}<span className="text-gray-300">/15</span></span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(s.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="bg-white border border-gray-100 text-fbNavy font-black text-[10px] px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-fbNavy hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto group/btn">
                      <Eye className="w-3 h-3 text-fbOrange group-hover/btn:text-white" />
                      View Full Log
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Search className="w-12 h-12" />
                      <p className="font-black italic uppercase tracking-[0.3em] text-xs">No records matching search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGuard>
  );
}
