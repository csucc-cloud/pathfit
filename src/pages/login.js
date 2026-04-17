// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Timer, 
  Flame,
  Zap
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
    <div className="min-h-screen w-full bg-[#F8F9FD] flex items-center justify-center p-0 md:p-6 overflow-hidden selection:bg-fbOrange/20 font-sans">
      <style jsx global>{`
        @keyframes entrance {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes run-bounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes trail-slide {
          0% { transform: translateX(0); opacity: 0.8; }
          100% { transform: translateX(-150px); opacity: 0; }
        }
        .animate-entrance { animation: entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-run { animation: run-bounce 0.4s ease-in-out infinite; }
        .motion-trail { animation: trail-slide 0.6s linear infinite; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1100px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-0 md:border border-gray-100 flex overflow-hidden">
        
        {/* COLUMN 1: LOGIN FORM */}
        <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-between relative z-10 bg-white border-r border-gray-50">
          <div className="animate-entrance">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-fbOrange rounded-2xl flex items-center justify-center shadow-lg shadow-fbOrange/30">
                <LogIn className="text-white w-6 h-6" />
              </div>
              <h2 className="text-fbNavy font-black tracking-tighter text-xl italic uppercase">PATH<span className="text-fbOrange">FIT</span></h2>
            </div>

            <h1 className="text-4xl font-black text-fbNavy mb-4 leading-tight">
              Push Your <br />
              <span className="text-fbOrange uppercase tracking-tighter italic">Limits.</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-xs">
              Sign in to track your exercises, calories, and university fitness milestones.
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
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} className="text-fbOrange group-hover:text-white" />}
              {loading ? 'Processing...' : 'Start Session'}
            </button>
          </form>

          <div className="animate-entrance delay-2">
            <button 
              onClick={() => router.push('/auth/register')}
              className="group text-xs font-bold text-gray-400 hover:text-fbOrange transition-all flex items-center gap-2"
            >
              No account? <span className="underline decoration-2 underline-offset-4 group-hover:text-fbOrange">Create here!</span> <ChevronRight size={14} />
            </button>
            
            <div className="mt-8 flex items-center gap-4 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              <span>PORTAL V1.0</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <button onClick={handleSecretTap} className="hover:text-fbOrange transition-colors">{tapCount > 0 ? `[${tapCount}]` : '1'}</button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: HUMAN RUNNER ANIMATION */}
        <div className="hidden md:flex md:w-[55%] bg-[#0A0F1E] relative items-center justify-center overflow-hidden">
          
          {/* Animated Background Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-fbOrange/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fbOrange/5 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center">
            
            <div className="relative">
              {/* SPRINTING TRAILS */}
              <div className="absolute top-1/2 left-[-100px] -translate-y-1/2 flex flex-col gap-4">
                <div className="motion-trail w-32 h-[2px] bg-gradient-to-r from-transparent to-fbOrange" />
                <div className="motion-trail w-48 h-[1px] bg-gradient-to-r from-transparent to-white/40 delay-75" />
                <div className="motion-trail w-28 h-[3px] bg-gradient-to-r from-transparent to-fbOrange/50 delay-150" />
              </div>

              {/* HUMAN RUNNER SVG */}
              <div className="animate-run">
                <svg width="220" height="220" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-[0_0_30px_rgba(255,107,0,0.4)]">
                  <path d="M15 5.5C15 6.32843 14.3284 7 13.5 7C12.6716 7 12 6.32843 12 5.5C12 4.67157 12.6716 4 13.5 4C14.3284 4 15 4.67157 15 5.5Z" fill="white"/>
                  <path d="M12 9L10.5 13L7 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 8L11 15.5L14 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 15.5L7 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 8L17 7.5L19 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 8C13.5 8 11.5 8.5 10.5 9.5C9.5 10.5 10.5 13 10.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* LIVE DASHBOARD HUD */}
            <div className="mt-20 flex gap-6 animate-entrance delay-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                  <Timer size={14} className="text-fbOrange" />
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Duration</span>
                </div>
                <p className="text-white font-bold text-xl uppercase italic">45:12</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={14} className="text-fbOrange" />
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Kcal Burned</span>
                </div>
                <p className="text-white font-bold text-xl uppercase italic">842</p>
              </div>
            </div>
            
            {/* BACKGROUND TEXT */}
            <h3 className="absolute bottom-[-20px] text-white/5 text-9xl font-black italic uppercase tracking-tighter select-none pointer-events-none">
              ATHLETE
            </h3>
          </div>

          {/* GRID OVERLAY */}
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>
      </div>
    </div>
  );
}
