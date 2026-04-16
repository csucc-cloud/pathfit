import React from 'react';
import { Dumbbell, Clock, Lock, Flame, Activity } from 'lucide-react';

export default function FitnessLogTab({ logs }) {
  // Calculate quick stats locally for this tab
  const totalWorkouts = logs.length;
  const latestActivity = logs[0]?.exercise_type || "No activity yet";

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid inside the tab */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
          <Flame size={24} className="mx-auto text-fbOrange mb-2" />
          <p className="text-xl font-black text-fbNavy">{totalWorkouts}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase">Total Logs</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center col-span-2">
          <Activity size={24} className="mx-auto text-blue-500 mb-2" />
          <p className="text-sm font-black text-fbNavy truncate px-2">{latestActivity}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase">Latest Activity</p>
        </div>
      </div>

      {/* The Actual List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-black text-fbNavy mb-6">Exercise History</h2>
        
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-fbOrange transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-fbOrange shadow-sm">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <p className="font-black text-fbNavy text-sm capitalize">
                      {log.exercise_type || log.activity_name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-fbOrange">
                    {log.duration || log.reps || log.result || '--'}
                  </p>
                  <p className="text-[10px] uppercase font-black text-gray-400">Score/Result</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-fbGray rounded-2xl border-2 border-dashed border-gray-200">
            <Lock size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Logs Available</p>
          </div>
        )}
      </div>
    </div>
  );
}
