import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  X, 
  Plus, 
  Clock, 
  Hash, 
  BookOpen, 
  Loader2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function CreateSectionModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    section_code: '',
    course_name: 'PATHFIT 1',
    schedule: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Get current instructor's ID from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("You must be logged in to create a section.");
      }

      // 2. Insert data including the instructor_id to satisfy the DB constraint
      const { error: submitError } = await supabase
        .from('sections')
        .insert([{
          ...formData,
          instructor_id: user.id 
        }]);

      if (submitError) throw submitError;

      // Success feedback
      setFormData({ section_code: '', course_name: 'PATHFIT 1', schedule: '' });
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with heavy blur for focus */}
      <div 
        className="absolute inset-0 bg-fbNavy/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-[45px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden border border-gray-100 animate-entrance">
        
        {/* Design Element: Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-fbNavy via-fbOrange to-fbNavy" />

        <div className="p-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-fbOrange/10 p-2 rounded-xl">
                  <Plus className="w-5 h-5 text-fbOrange" />
                </div>
                <h2 className="text-3xl font-black text-fbNavy uppercase italic tracking-tighter leading-none">
                  Create <span className="text-fbOrange">Section</span>
                </h2>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={12} className="text-green-500" /> Instructor Verified Portal
              </p>
            </div>
            <button 
              onClick={onClose}
              className="group p-3 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
            >
              <X size={20} className="text-gray-300 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section Code Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-fbNavy uppercase italic ml-3">Identity Code</label>
                <div className="relative group">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-fbOrange transition-colors" />
                  <input 
                    required
                    type="text"
                    placeholder="SEC-A"
                    className="w-full pl-14 pr-6 py-5 bg-fbGray/10 border-2 border-transparent rounded-[25px] text-sm font-black text-fbNavy outline-none focus:bg-white focus:border-fbOrange/20 focus:ring-4 focus:ring-fbOrange/5 transition-all uppercase placeholder:text-gray-300"
                    value={formData.section_code}
                    onChange={(e) => setFormData({...formData, section_code: e.target.value})}
                  />
                </div>
              </div>

              {/* Course Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-fbNavy uppercase italic ml-3">Course Title</label>
                <div className="relative group">
                  <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-fbOrange transition-colors" />
                  <input 
                    required
                    type="text"
                    className="w-full pl-14 pr-6 py-5 bg-fbGray/10 border-2 border-transparent rounded-[25px] text-sm font-black text-fbNavy outline-none focus:bg-white focus:border-fbOrange/20 focus:ring-4 focus:ring-fbOrange/5 transition-all"
                    value={formData.course_name}
                    onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Schedule Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-fbNavy uppercase italic ml-3">Training Schedule</label>
              <div className="relative group">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-fbOrange transition-colors" />
                <input 
                  required
                  type="text"
                  placeholder="e.g., TTH 1:00PM - 3:00PM"
                  className="w-full pl-14 pr-6 py-5 bg-fbGray/10 border-2 border-transparent rounded-[25px] text-sm font-black text-fbNavy outline-none focus:bg-white focus:border-fbOrange/20 focus:ring-4 focus:ring-fbOrange/5 transition-all placeholder:text-gray-300"
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col md:flex-row gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="order-2 md:order-1 flex-1 py-5 rounded-[25px] text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-fbNavy transition-all"
              >
                Discard
              </button>
              <button 
                disabled={loading}
                className="order-1 md:order-2 flex-[2] bg-fbNavy text-white py-5 rounded-[25px] text-xs font-black uppercase tracking-[0.2em] hover:bg-fbOrange transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-fbOrange/20 active:scale-95 flex items-center justify-center gap-3 disabled:bg-gray-400"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {loading ? 'Processing...' : 'Deploy Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
