import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAdminData } from '../../hooks/useAdminData';

export default function AdminDashboard() {
  const [pId, setPId] = useState(1);
  const { students, loading } = useAdminData(pId);

  return (
    <Layout>
      <main className="p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-fbNavy">Instructor Console</h1>
            <p className="text-gray-500 font-medium">Monitoring 500+ Student Enrollments</p>
          </div>
          
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
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
        </header>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-fbGray border-b border-gray-100">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Student ID</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Completion</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Last Activity</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center animate-pulse text-gray-400">Loading master records...</td></tr>
              ) : students.map((s) => (
                <tr key={s.id} className="hover:bg-fbGray/50 transition-colors">
                  <td className="p-4 font-bold text-sm text-fbNavy font-mono">{s.id.slice(0, 8)}...</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[100px]">
                        <div 
                          className="h-full bg-fbOrange rounded-full" 
                          style={{ width: `${(s.exercises / 15) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-fbNavy">{s.exercises}/15</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    {new Date(s.lastActive).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-fbOrange font-bold text-xs hover:underline">View Full Log</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  );
}
