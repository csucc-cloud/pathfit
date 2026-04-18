// src/pages/waiting-room.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  ShieldCheck, 
  Clock, 
  LogOut, 
  RefreshCw, 
  Zap,
  Lock,
  MessageSquare
} from 'lucide-react';

export default function WaitingRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('status, full_name')
      .eq('id', user.id)
      .single();

    if (data?.status === 'active') {
      router.push('/dashboard'); 
    } else {
      setProfile(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    /* Note: We are not wrapping this in any Layout component 
       to ensure the sidebar and topbar are completely hidden.
    */
    <div className="min-h-screen w-full bg-[#F8F9FD] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[60px] p-12 shadow-[0_40px_100px_-20px_rgba(26,42,74,0.1)] border border-slate-100 text-center relative overflow-hidden animate-entrance">
        
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-fbOrange/5 rounded-full blur-3xl" />
        
        {/* Header Icon */}
        <div className="relative mb-10 inline-block">
          <div className="w-24 h-24 bg-fbNavy rounded-[35px] flex items-center justify-center shadow-2xl shadow-fbNavy/20 transform -rotate-6">
            <Lock className="text-white" size={40} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-fbOrange rounded-2xl flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
            <Zap size={16} className="text-white fill-white" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter leading-none mb-4">
          Access <span className="text-fbOrange">Pending</span>
        </h1>
        
        <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mb-8 leading-relaxed">
          Identity established. Your credentials are currently being verified by the <span className="text-fbNavy font-black">PATHFIT Instructor</span>.
        </p>

        {/* Status Card */}
        <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 mb-10 text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-sans">Protocol Status</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-fbOrange/10 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-fbOrange animate-pulse" />
               <span className="text-[10px] font-black text-fbOrange uppercase italic">Verifying</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-50">
               <Clock size={20} className="text-fbNavy" />
            </div>
            <div>
              <p className="text-[13px] font-black text-fbNavy uppercase italic">
                {profile?.full_name || 'Practitioner'}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Awaiting clearance...
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button 
            onClick={checkStatus}
            disabled={loading}
            className="w-full py-5 bg-fbNavy text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-fbNavy/20 hover:shadow-fbOrange/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} className="group-hover:scale-125 transition-transform" />}
            Check Authorization
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Cancel & Exit System
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center gap-3">
          <MessageSquare size={14} className="text-fbOrange" />
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
            Need help? Contact your Instructor directly.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes entrance {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-entrance {
          animation: entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
