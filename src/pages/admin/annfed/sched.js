import React, { useState } from 'react';
import { useRouter } from 'next/router';
import RoleGuard from '../../../components/RoleGuard';
import { motion } from 'framer-motion';
import { 
  Zap, CalendarDays, MapPin, Users, Clock, Target, 
  Copyright, Sparkles, AlertTriangle, HelpCircle, ChevronRight
} from 'lucide-react';

const containerVariants = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } } 
};

const nodeVariants = { 
  hidden: { opacity: 0, y: 20 }, 
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } 
};

// Data Plotting: 3 Sections with different time slots
const scheduleData = [
  { id: 1, section: "CS2A", day: "Mon", timeSlot: "09:00 - 10:00", room: "NODE-4A", students: 38, capacity: 40 },
  { id: 2, section: "CS2A", day: "Wed", timeSlot: "09:00 - 10:00", room: "NODE-4A", students: 38, capacity: 40 },
  { id: 3, section: "IT3C", day: "Tue", timeSlot: "11:00 - 12:00", room: "LAB-2B", students: 42, capacity: 45 },
  { id: 4, section: "IT3C", day: "Thu", timeSlot: "11:00 - 12:00", room: "LAB-2B", students: 42, capacity: 45 },
  { id: 5, section: "IS1B", day: "Mon", timeSlot: "14:00 - 15:00", room: "NODE-1A", students: 35, capacity: 40 },
  { id: 6, section: "IS1B", day: "Fri", timeSlot: "14:00 - 15:00", room: "NODE-1A", students: 35, capacity: 40 },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const timeSlots = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", 
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
];

// EDUOS Branding Colors
const sectionColors = {
  CS2A: "bg-fbOrange text-white shadow-fbOrange/30",
  IT3C: "bg-[#0B1120] text-fbOrange ring-1 ring-white/10 shadow-black/20",
  IS1B: "bg-white text-[#0B1120] ring-1 ring-slate-200 shadow-sm",
};

export default function SchedulePage() {
  const router = useRouter();

  return (
    <RoleGuard allowedRole="instructor">
      <div className="min-h-full bg-[#EEF0F6] font-sans selection:bg-fbOrange/30">
        
        {/* HEADER SECTION - Imitating index.js branding */}
        <motion.header 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants} 
          className="w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 lg:px-10 py-8 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#0B1120] rounded-2xl shadow-xl shadow-[#0B1120]/10" style={{ transform: 'rotate(-3deg)' }}>
                <CalendarDays size={22} className="text-fbOrange" />
              </div>
              <div>
                <h1 className="text-2xl font-black italic text-[#0B1120] tracking-tighter uppercase leading-none">
                  Temporal<span className="text-fbOrange"> Matrix</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Weekly Class Distribution v2.4</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button className="px-4 py-2 bg-white text-[#0B1120] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">Matrix View</button>
              <button className="px-4 py-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-[#0B1120] transition-colors">List View</button>
            </div>
          </div>
        </motion.header>

        {/* MAIN MATRIX GRID */}
        <main className="px-6 lg:px-10 pb-10">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            {/* GRID TABLE */}
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-[1000px]">
                
                {/* HEADERS */}
                <div className="grid grid-cols-[120px_repeat(5,1fr)] bg-slate-50/50 border-b border-slate-100">
                  <div className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] self-center">Node Time</div>
                  {days.map(day => (
                    <div key={day} className="p-6 text-center border-l border-slate-100">
                      <p className="text-[#0B1120] text-sm font-black tracking-tighter italic uppercase">{day}</p>
                    </div>
                  ))}
                </div>

                {/* MATRIX BODY */}
                <div className="grid grid-cols-[120px_repeat(5,1fr)] divide-x divide-slate-100">
                  
                  {/* TIME AXIS */}
                  <div className="bg-slate-50/30">
                    {timeSlots.map(slot => (
                      <div key={slot} className="h-32 flex items-center justify-center border-b border-slate-100 last:border-0 px-4">
                        <span className="text-[10px] font-black text-slate-400 text-center leading-tight uppercase tracking-tighter italic">{slot}</span>
                      </div>
                    ))}
                  </div>

                  {/* DAY COLUMNS */}
                  {days.map(day => (
                    <div key={day} className="relative group">
                      {timeSlots.map(slot => {
                        const activeNode = scheduleData.find(c => c.day === day && c.timeSlot === slot);
                        
                        return (
                          <div key={slot} className="h-32 border-b border-slate-100 last:border-0 p-2 relative group-hover:bg-slate-50/50 transition-colors">
                            {activeNode && (
                              <motion.div 
                                variants={nodeVariants}
                                whileHover={{ y: -2, scale: 1.02 }}
                                className={`absolute inset-2 p-4 rounded-2xl shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer ${sectionColors[activeNode.section]}`}
                              >
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-[11px] font-black uppercase tracking-tight italic">{activeNode.section}</h4>
                                    <Zap size={10} className={activeNode.section === 'CS2A' ? 'text-white/50' : 'text-fbOrange'} />
                                  </div>
                                  <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest">{activeNode.room}</p>
                                </div>

                                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-current/10 relative z-10">
                                  <Users size={10} />
                                  <span className="text-[9px] font-black tracking-tighter uppercase">{activeNode.students}/{activeNode.capacity}</span>
                                </div>

                                {/* Decorative Background Icon */}
                                <div className="absolute -bottom-2 -right-2 opacity-10">
                                  <Target size={48} />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* FOOTER - Reused branding from index.js */}
        <footer className="px-10 py-10 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-slate-400">
            <Copyright size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">2026 PATHFIT • EDUOS TERMINAL</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-fbOrange/5 rounded-full border border-fbOrange/10">
            <div className="h-1.5 w-1.5 rounded-full bg-fbOrange animate-pulse" />
            <span className="text-[9px] font-black text-fbOrange uppercase tracking-widest">Active Schedule Node</span>
          </div>
        </footer>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #F1F5F9; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF6B00; }
        `}</style>
      </div>
    </RoleGuard>
  );
  }
