// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, Loader2, Sparkles, Trophy, Dumbbell, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen w-full bg-[#F8F9FD] flex items-center justify-center p-0 md:p-6 overflow-hidden selection:bg-fbOrange/10">
      {/* GLOBAL CSS ANIMATIONS */}
      <style jsx global>{`
        @keyframes entranceFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatEffect {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes auraPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-entrance { animation: entranceFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .animate-float { animation: floatEffect 6s ease-in-out infinite; }
        .animate-aura { animation: auraPulse 4s ease-in-out infinite; }
      `}</style>

      {/* SPLIT-SCREEN CONTAINER */}
      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1200px] md:rounded-[40px] shadow-[0_30px_90px_0_rgba(20,30,80,0.1)] border-0 md:border border-gray-100 flex overflow-hidden">
        
        {/* ==========================================================
            COLUMN 1: THE LOGIN FORM (WHITE/ORANGE AESTHETIC)
            ========================================================== */}
        <div className="w-full md:w-[45%] p-10 md:p-16 lg:p-20 flex flex-col justify-between">
          
          {/* TOP SECTION: LOGO & WELCOME */}
          <div className="animate-entrance delay-1">
            <div className="relative w-16 h-16 mb-12 group cursor-pointer">
              <div className="absolute inset-0 bg-fbOrange rounded-[20px] rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-xl shadow-fbOrange/30" />
              <div className="absolute inset-0 bg-white rounded-[20px] border-2 border-fbOrange/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                <LogIn className="text-fbOrange w-7 h-7" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 text-fbOrange animate-pulse" size={18} />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-fbNavy tracking-tight leading-tight mb-4 drop-shadow-sm">
              PATH<span className="text-fbOrange">FIT</span><br />
              Athlete <span className="text-fbOrange underline decoration-fbOrange/10 underline-offset-8">Portal</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm">
              Unlock your university fitness journey. Monitor logs, analyze progress, and achieve peak performance.
            </p>
          </div>

          {/* MIDDLE SECTION: FORM */}
          <form onSubmit={handleEmailAuth} className="space-y-4 my-12 animate-entrance delay-2">
            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-fbOrange transition-colors duration-300" />
              <input 
                type="email" 
                placeholder="University Email" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F8F9FD] border-2 border-transparent text-fbNavy text-sm font-semibold focus:border-fbOrange/30 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:font-medium"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-fbOrange transition-colors duration-300" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F8F9FD] border-2 border-transparent text-fbNavy text-sm font-semibold focus:border-fbOrange/30 focus:bg-white outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:font-medium"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-fbNavy text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 hover:bg-fbOrange hover:shadow-2xl hover:shadow-fbOrange/30 disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-fbOrange group-hover:text-white transition-colors" />
              )}
              {loading ? 'Authenticating...' : 'Enter the Portal'}
            </button>
          </form>

          {/* BOTTOM SECTION: ACTIONS & FOOTER */}
          <div className="text-center space-y-6 animate-entrance delay-3">
            <button 
              onClick={() => router.push('/auth/register')}
              className="group text-xs font-bold text-gray-500 hover:text-fbNavy transition-all flex items-center justify-center gap-2 mx-auto tracking-tight"
            >
              First time here? <span className="text-fbOrange group-hover:underline">Create a Student Account</span> <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-4 text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] select-none">
                <span>V1.0</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                <button 
                  type="button" 
                  onClick={handleSecretTap}
                  className="hover:text-fbOrange transition-all"
                >
                  {tapCount > 0 ? `[${tapCount}]` : '1'}
                </button>
                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                <span>2026</span>
            </div>
          </div>
        </div>

        {/* ==========================================================
            COLUMN 2: THE FITNESS ILLUSTRATION/ANIMATION
            ========================================================== */}
        <div className="hidden md:flex md:w-[55%] bg-gradient-to-br from-white to-[#F0F2F9] relative items-center justify-center p-20 border-l border-gray-100 overflow-hidden">
          
          {/* HIGH-END AURA/GLOW BACKGROUND ANIMATION */}
          <div className="absolute inset-0 z-0">
            <div className="animate-aura absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-fbOrange/10 rounded-full blur-[100px]" />
            <div className="animate-aura absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
          </div>

          {/* ABSTRACT FITNESS SYMBOLS (FLOATING ILLUSTRATION) */}
          <div className="animate-float relative z-10 w-full h-full flex flex-col items-center justify-center">
            
            {/* trophy - Centerpiece */}
            <div className="relative group transition-transform duration-700 hover:scale-105">
              <Trophy className="text-fbOrange drop-shadow-[0_20px_40px_rgba(255,107,0,0.3)]" size={160} strokeWidth={1} />
              <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-fbOrange/10 rounded-full blur-3xl -z-1" />
            </div>

            {/* Orbiting Elements */}
            <div className="absolute w-[300px] h-[300px] rounded-full border border-gray-100 pointer-events-none">
              <div className="absolute top-[10%] left-[10%] p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 text-fbNavy animate-pulse" style={{ animationDuration: '4s' }}>
                <Dumbbell size={24} />
              </div>
              <div className="absolute bottom-[10%] right-[10%] p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 text-green-500 animate-pulse" style={{ animationDuration: '3s' }}>
                <Activity size={24} />
              </div>
              <div className="absolute top-[10%] right-[10%] p-2 bg-fbOrange/5 text-fbOrange rounded-full border border-fbOrange/10 scale-90">
                <Sparkles size={16} />
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex gap-4 mt-20 relative z-10">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                <CheckCircle2 className="text-green-500" size={16} />
                <span className="text-xs font-black text-fbNavy uppercase tracking-widest">Active Progression</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform">
                <Flame className="text-fbOrange" size={16} />
                <span className="text-xs font-black text-fbNavy uppercase tracking-widest">Burned KCAL</span>
              </div>
            </div>
          </div>
          
          {/* Subtle Cubes Pattern Over Gradient */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
        </div>
      </div>
    </div>
  );
}

// Icons for the illustration panel status indicators
function Flame({ size = 20, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
