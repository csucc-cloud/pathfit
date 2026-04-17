// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Triple-tap secret logic
  const [tapCount, setTapCount] = useState(0);

  // Resets the secret tap count if user stops tapping for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTapCount(0);
    }, 2000);
    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleSecretTap = () => {
    const nextCount = tapCount + 1;
    if (nextCount === 3) {
      router.push('/auth/faculty-enroll');
    } else {
      setTapCount(nextCount);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    // 1. Authenticate the user
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // 2. Check if the authenticated user is an instructor
      const { data: instructor } = await supabase
        .from('instructors')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (instructor) {
        // Teleport to Instructor Dashboard
        router.push('/admin');
      } else {
        // UPDATED: Teleport to the new Student Dashboard
        router.push('/dashboard'); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#0A0F1E]">
      {/* ANIMATED BACKGROUND LAYER 
          High-end mesh gradients that move subtly in the background 
      */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fbOrange/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-bounce" style={{ animationDuration: '15s' }} />
      </div>

      {/* CUSTOM KEYFRAME ANIMATIONS */}
      <style jsx global>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-float-in {
          animation: floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* GLASSMORPHISM CARD */}
      <div className="animate-float-in relative z-10 w-full max-w-[420px]">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)]">
          
          {/* BRAND LOGO - High Transition interaction */}
          <div className="relative w-20 h-20 mx-auto mb-8 group cursor-pointer">
            <div className="absolute inset-0 bg-fbOrange rounded-[24px] rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-[0_0_30px_rgba(255,107,0,0.4)]" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 flex items-center justify-center transform group-hover:scale-110 transition-all duration-500">
              <LogIn className="text-white w-9 h-9" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-fbOrange animate-pulse" size={20} />
          </div>

          {/* BRANDING TEXT */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight italic">
              PATH<span className="text-fbOrange">FIT</span> <span className="text-xs align-top not-italic font-medium text-white/40">®</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-[1px] w-6 bg-white/10" />
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Student Portal</p>
              <span className="h-[1px] w-6 bg-white/10" />
            </div>
          </div>
          
          {/* FORM */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fbOrange transition-colors duration-300" />
              <input 
                type="email" 
                placeholder="University Email" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:border-fbOrange/50 focus:bg-white/10 outline-none transition-all duration-300 placeholder:text-gray-600"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-fbOrange transition-colors duration-300" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:border-fbOrange/50 focus:bg-white/10 outline-none transition-all duration-300 placeholder:text-gray-600"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full overflow-hidden bg-fbOrange p-[1px] rounded-2xl transition-all active:scale-95 hover:shadow-[0_0_40px_rgba(255,107,0,0.3)] disabled:opacity-50"
            >
              <div className="relative bg-[#0A0F1E] group-hover:bg-transparent py-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-fbOrange" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-fbOrange group-hover:text-white transition-colors duration-300" />
                )}
                <span className="text-white font-black uppercase tracking-widest text-xs">
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </span>
              </div>
            </button>
          </form>

          {/* FOOTER ACTIONS */}
          <div className="mt-8 text-center space-y-6">
            <button 
              onClick={() => router.push('/auth/register')}
              className="group text-[11px] font-bold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto uppercase tracking-tighter"
            >
              Don't have an account? 
              <span className="text-fbOrange underline decoration-2 underline-offset-4 group-hover:text-white transition-colors">
                Register Here
              </span>
            </button>

            {/* SECRET TAP AREA */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex justify-center items-center gap-4 text-[9px] text-gray-600 font-black uppercase tracking-[0.4em] select-none">
                <span>V.1.0</span>
                <span className="w-1 h-1 bg-gray-800 rounded-full" />
                <button 
                  type="button" 
                  onClick={handleSecretTap}
                  className="hover:text-fbOrange transition-all active:scale-125"
                >
                  {tapCount > 0 ? `[${tapCount}]` : '1'}
                </button>
                <span className="w-1 h-1 bg-gray-800 rounded-full" />
                <span>2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
