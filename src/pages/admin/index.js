// src/pages/admin/index.js
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAdminData } from '../../hooks/useAdminData';
import { downloadCSV } from '../../utils/exportHelper'; 
// Importing Lucide icons for high-volume management UI
import { 
  Users, 
  Search, 
  FileDown, 
  Eye, 
  LayoutDashboard, 
  Loader2,
  Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const [pId, setPId] = useState(1);
  const { students, loading } = useAdminData(pId);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students based on ID search without mutating original data
  const filteredStudents = students.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredStudents.map(s => ({
      StudentID: s.id,
      ExercisesCompleted: s.exercises,
      Progress: `${Math.round((s.exercises / 15) * 100)}%`,
      LastActive: new Date(s.lastActive).toLocaleDateString(),
    }));
    downloadCSV(exportData, `PATHFit_Practicum_${pId}_Grades`);
  };

  return (
    <Layout>
      <main className="p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-fbOrange" />
              <h1 className="text-3xl font-black text-fbNavy">Instructor Console</h1>
            </div>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Monitoring 500+ Student Enrollments
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input with Lucide Search Icon */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search Student ID..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-fbOrange outline-none w-64 shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Export Action with FileDown Icon */}
            <button 
              onClick={handleExport}
              className="bg-white border border-gray-200 text-fbNavy font-bold px-4 py-2 rounded-xl text-sm hover:bg-fbGray transition-all flex items-center gap-2 shadow-sm"
            >
              <FileDown className="w-4 h-4 text-fbOrange" />
              Export
            </button>

            {/* Your Original Practicum Toggle */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setPId(num)}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                    pId === num ? 'bg-fbOrange text-white shadow-md' : 'text-gray-400 hover:bg-fbGray'
                  }`}
                >
                  Practicum {num}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-fbGray border-b border-gray-100">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">
                  <div className="flex items-center gap-2">Student ID</div>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Completion</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">
                   <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-fbOrange" /> Last Activity
                   </div>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-fbOrange" />
                      <p className="animate-pulse">Loading master records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-fbGray/50 transition-colors group">
                  <td className="p-4 font-bold text-sm text-fbNavy font-mono uppercase tracking-tight">
                    {s.id.slice(0, 8)}...
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[100px]">
                        <div 
                          className="h-full bg-fbOrange rounded-full shadow-[0_0_8px_rgba(245,124,0,0.4)] transition-all duration-700" 
                          style={{ width: `${(s.exercises / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-fbNavy">{s.exercises}/15</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500 font-medium">
                    {new Date(s.lastActive).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-fbOrange font-bold text-xs hover:underline flex items-center gap-1 justify-end ml-auto group-hover:translate-x-[-4px] transition-transform">
                      <Eye className="w-3 h-3" />
                      View Full Log
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p className="font-bold">No student records found.</p>
                      <span className="text-xs opacity-60">Try searching for a different ID</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  );
}
