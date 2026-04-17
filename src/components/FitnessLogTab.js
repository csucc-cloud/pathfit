import React from 'react';
import { Dumbbell, Clock, Lock, Flame, Activity } from 'lucide-react';
import { PATHFIT_EXERCISES } from '../constants/exercises';

export default function FitnessLogTab({ logs }) {
  // Helper to get exercise name from the constant list
  const getExName = (id) => PATHFIT_EXERCISES.find(e => e.id === id)?.name || "Exercise";

  // Calculate quick stats locally for this tab
  const totalWorkouts = logs.length;
  const latestActivity = logs.length > 0 ? getExName(logs[logs.length - 1].exercise_id) : "No activity yet";

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
            {logs.map((log) => {
              const exInfo = PATHFIT_EXERCISES.find(e => e.id === log.exercise_id);
              const totalReps = (log.set_1_val || 0) + (log.set_2_val || 0) + (log.set_3_val || 0);
              
              return (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-fbOrange transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-fbOrange shadow-sm group-hover:scale-110 transition-transform">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="font-black text-fbNavy text-sm capitalize">
                        {getExName(log.exercise_id)}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.updated_at || log.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 text-fbOrange"><Flame size={12} /> {log.calories_burned || 0} kcal</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-fbNavy">
                      {totalReps} <span className="text-[10px] text-gray-400 uppercase">{exInfo?.unit || 'reps'}</span>
                    </p>
                    <p className="text-[10px] uppercase font-black text-gray-400">Total Volume</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#F8F9FA] rounded-2xl border-2 border-dashed border-gray-200">
            <Lock size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Logs Available</p>
          </div>
        )}
      </div>
    </div>
  );
}
