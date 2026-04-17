// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Timer, 
  Flame 
} from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setTapCount(0), 2000);
    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleSecretTap = () => {
    const nextCount = tapCount + 1;
    if (nextCount === 3) router.push('/auth/faculty-enroll');
    else setTapCount(nextCount);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      const { data: instructor } = await supabase
        .from('instructors')
        .select('id')
        .eq('id', data.user.id)
        .single();

      router.push(instructor ? '/admin' : '/dashboard'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FD] flex items-center justify-center p-0 md:p-6 overflow-hidden selection:bg-fbOrange/20">
      <style jsx global>{`
        @keyframes entrance {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes sprint {
          0% { transform: translate(0, 0) skewX(-5deg); }
          50% { transform: translate(10px, -5px) skewX(-10deg); }
          100% { transform: translate(0, 0) skewX(-5deg); }
        }
        @keyframes trail {
          0% { opacity: 0.8; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(-100px) scale(0.8); }
        }
        @keyframes pulseAura {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
        .animate-entrance { animation: entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-sprint { animation: sprint 0.6s ease-in-out infinite; }
        .motion-trail { animation: trail 1.5s linear infinite; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1100px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-0 md:border border-gray-100 flex overflow-hidden">
        
        {/* COLUMN 1: THE LOGIN FORM */}
        <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-between relative z-10 bg-white">
          <div className="animate-entrance">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-fbOrange rounded-2xl flex items-center justify-center shadow-lg shadow-fbOrange/30">
                <LogIn className="text-white w-6 h-6" />
              </div>
              <h2 className="text-fbNavy font-black tracking-tighter text-xl italic">PATH<span className="text-fbOrange">FIT</span></h2>
            </div>

            <h1 className="text-4xl font-black text-fbNavy mb-4 leading-tight">
              Start Your <br />
              <span className="text-fbOrange uppercase tracking-tighter">Sprint.</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-xs">
              Sign in to access your fitness curriculum and track your university physical progress.
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 my-10 animate-entrance delay-1">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-fbOrange transition-colors" />
              <input 
                type="email" 
                placeholder="University Email" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 focus:bg-white outline-none transition-all font-semibold text-fbNavy text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-fbOrange transition-colors" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 focus:bg-white outline-none transition-all font-semibold text-fbNavy text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-fbNavy text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-fbOrange transition-all active:scale-95 shadow-xl shadow-fbNavy/10 hover:shadow-fbOrange/30 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
              {loading ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>

          <div className="animate-entrance delay-2">
            <button 
              onClick={() => router.push('/auth/register')}
              className="text-xs font-bold text-gray-400 hover:text-fbOrange transition-colors flex items-center gap-2"
            >
              Need an account? <span className="underline decoration-2 underline-offset-4">Register as Student</span> <ChevronRight size={14} />
            </button>
            
            <div className="mt-8 flex items-center gap-4 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              <span>PATHFIT PORTAL</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <button onClick={handleSecretTap} className="hover:text-fbOrange transition-colors">V1.{tapCount}</button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: SPRINTING ANIMATION */}
        <div className="hidden md:flex md:w-[55%] bg-[#0A0F1E] relative items-center justify-center overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute w-[500px] h-[500px] bg-fbOrange/10 rounded-full blur-[120px] animate-pulse" />
          
          {/* The Runner Illustration Container */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* The Sprinter Figure (Minimalist CSS Art) */}
            <div className="animate-sprint relative">
              {/* Main Body */}
              <div className="w-32 h-40 bg-white rounded-full opacity-10 blur-2xl absolute -inset-4" />
              <div className="relative">
                {/* Sprinting Silhouette (Icon based) */}
                <div className="text-white relative z-20">
                  <Activity size={180} strokeWidth={1} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                </div>
                
                {/* Motion Trails */}
                <div className="absolute top-1/2 left-0 -translate-x-full space-y-4">
                  <div className="motion-trail w-32 h-1 bg-gradient-to-r from-transparent to-fbOrange rounded-full" />
                  <div className="motion-trail w-48 h-[2px] bg-gradient-to-r from-transparent to-white/40 rounded-full delay-75" />
                  <div className="motion-trail w-24 h-1 bg-gradient-to-r from-transparent to-fbOrange/60 rounded-full delay-150" />
                </div>
              </div>
            </div>

            {/* Performance Stats HUD */}
            <div className="mt-16 flex gap-6">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                <div className="w-10 h-10 bg-fbOrange/20 rounded-xl flex items-center justify-center">
                  <Timer className="text-fbOrange" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pace</p>
                  <p className="text-white font-black">4'12"/km</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-green-500" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Weekly</p>
                  <p className="text-white font-black">Target Met</p>
                </div>
              </div>
            </div>
            
            <p className="absolute bottom-10 text-white/20 font-black text-6xl italic select-none uppercase tracking-tighter">
              Progression
            </p>
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
      </div>
    </div>
  );
}
