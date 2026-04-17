import React, { useMemo } from 'react';
import { Dumbbell, Clock, Lock, Flame, Activity, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { PATHFIT_EXERCISES } from '../constants/exercises';

export default function FitnessLogTab({ logs }) {
  // Helper to get exercise name from the constant list
  const getExName = (id) => PATHFIT_EXERCISES.find(e => e.id === id)?.name || "Exercise";

  // Calculate stats locally
  const totalWorkouts = logs.length;
  const latestActivity = logs.length > 0 ? getExName(logs[logs.length - 1].exercise_id) : "No activity yet";
  
  // Advanced Math: Total Calories Burned across all logs
  const totalCals = useMemo(() => 
    logs.reduce((sum, log) => sum + (Number(log.calories_burned) || 0), 0).toFixed(0), 
  [logs]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- ADVANCED ANALYTICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Energy Card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-fbOrange/5 w-24 h-24 rounded-full group-hover:scale-125 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-fbOrange/10 rounded-2xl flex items-center justify-center text-fbOrange mb-4">
              <Flame size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Energy Output</p>
            <h3 className="text-2xl font-black text-fbNavy mt-1">{totalCals} <span className="text-xs text-gray-400">kcal</span></h3>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-fbNavy p-5 rounded-3xl shadow-xl shadow-fbNavy/10 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 text-white"><Activity size={80} /></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-4">
              <Dumbbell size={20} />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Sessions</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalWorkouts} <span className="text-xs text-white/40 font-normal italic">completed</span></h3>
          </div>
        </div>

        {/* Focus Card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm group">
           <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
             <TrendingUp size={20} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Focus</p>
           <h3 className="text-sm font-black text-fbNavy mt-1 truncate uppercase tracking-tight">{latestActivity}</h3>
        </div>
      </div>

      {/* --- TIMELINE HISTORY SECTION --- */}
      <div className="bg-white p-2 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
        <div className="flex items-center justify-between px-4 mb-8">
            <div>
                <h2 className="text-xl font-black text-fbNavy tracking-tight">Activity Timeline</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Your progress over time</p>
            </div>
            <Calendar size={20} className="text-gray-300" />
        </div>
        
        {logs.length > 0 ? (
          <div className="space-y-4 relative">
            {/* Vertical Timeline Thread */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gray-100 via-gray-100 to-transparent hidden md:block" />

            {logs.slice().reverse().map((log) => {
              const exInfo = PATHFIT_EXERCISES.find(e => e.id === log.exercise_id);
              const totalReps = (log.set_1_val || 0) + (log.set_2_val || 0) + (log.set_3_val || 0);
              
              return (
                <div key={log.id} className="relative md:pl-12 group transition-all">
                  {/* Timeline Node */}
                  <div className="absolute left-[29px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-200 group-hover:bg-fbOrange group-hover:scale-125 transition-all z-10 hidden md:block" />

                  <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-3xl border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-500/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-fbGray rounded-2xl flex items-center justify-center text-fbNavy group-hover:bg-fbNavy group-hover:text-white transition-colors duration-500 shadow-inner">
                        <Dumbbell size={24} />
                      </div>
                      <div>
                        <p className="font-black text-fbNavy text-base tracking-tight leading-none mb-1">
                          {getExName(log.exercise_id)}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                          <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Clock size={12} /> {new Date(log.updated_at || log.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-fbOrange">
                            <Flame size={12} fill="currentColor" /> {log.calories_burned || 0} kcal
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-lg font-black text-fbNavy leading-none">
                                {totalReps} <span className="text-[10px] text-gray-400 uppercase font-bold">{exInfo?.unit || 'reps'}</span>
                            </p>
                            <p className="text-[9px] uppercase font-black text-gray-400 tracking-tighter">Performance</p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-fbOrange group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-fbGray/30 rounded-[2rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Lock size={32} className="text-gray-200" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Awaiting First Entry</p>
            <p className="text-[10px] text-gray-300 mt-2 font-bold uppercase">Log a workout to unlock timeline</p>
          </div>
        )}
      </div>
    </div>
  );
}
