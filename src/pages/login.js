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
        /* Literal Running Motion: Limbs and Body */
        @keyframes run-cycle {
          0% { transform: translateY(0) rotate(-2deg); }
          25% { transform: translateY(-8px) rotate(0deg); }
          50% { transform: translateY(0) rotate(2deg); }
          75% { transform: translateY(-8px) rotate(0deg); }
          100% { transform: translateY(0) rotate(-2deg); }
        }
        /* High Level Motion Trail Logic */
        @keyframes trail-fade {
          0% { transform: translateX(0) scale(1); opacity: 0.5; }
          100% { transform: translateX(-200px) scale(0.9); opacity: 0; }
        }
        /* Limbs Pumping Animation */
        @keyframes pump {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        
        .animate-entrance { animation: entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .runner-body { animation: run-cycle 0.6s ease-in-out infinite; }
        .ghost-trail { animation: trail-fade 0.8s linear infinite; position: absolute; }
        .delay-trail-1 { animation-delay: 0.1s; }
        .delay-trail-2 { animation-delay: 0.2s; }
        .delay-trail-3 { animation-delay: 0.3s; }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1100px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-0 md:border border-gray-100 flex overflow-hidden">
        
        {/* COLUMN 1: LOGIN FORM */}
        <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-between relative z-10 bg-white">
          <div className="animate-entrance">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-fbOrange rounded-2xl flex items-center justify-center shadow-lg shadow-fbOrange/30">
                <LogIn className="text-white w-6 h-6" />
              </div>
              <h2 className="text-fbNavy font-black tracking-tighter text-xl italic">PATH<span className="text-fbOrange">FIT</span></h2>
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

        {/* COLUMN 2: ADVANCED SPRINTING HUMAN ANIMATION */}
        <div className="hidden md:flex md:w-[55%] bg-[#0A0F1E] relative items-center justify-center overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-fbOrange/10 rounded-full blur-[120px] animate-pulse" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* SPRINTER CONTAINER */}
            <div className="relative w-[300px] h-[220px] flex items-center justify-center">
              
              {/* THE MOTION TRAILS (STAGGERED GHOSTS) */}
              <div className="ghost-trail delay-trail-3 opacity-10">
                <RunnerSVG color="#FF6B00" />
              </div>
              <div className="ghost-trail delay-trail-2 opacity-20">
                <RunnerSVG color="#FF6B00" />
              </div>
              <div className="ghost-trail delay-trail-1 opacity-30">
                <RunnerSVG color="#FFFFFF" />
              </div>

              {/* THE PRIMARY RUNNER */}
              <div className="runner-body relative z-20">
                <RunnerSVG color="#FFFFFF" glow />
              </div>

            </div>

            {/* LIVE DASHBOARD HUD */}
            <div className="mt-20 flex gap-6 animate-entrance delay-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] min-w-[140px] hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Timer size={14} className="text-fbOrange" />
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Duration</span>
                </div>
                <p className="text-white font-bold text-xl">45:12</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] min-w-[140px] hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={14} className="text-fbOrange" />
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Kcal Burned</span>
                </div>
                <p className="text-white font-bold text-xl">842</p>
              </div>
            </div>
            
            <h3 className="absolute bottom-[-20px] text-white/5 text-9xl font-black italic uppercase tracking-tighter select-none">
              ATHLETE
            </h3>
          </div>

          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>
      </div>
    </div>
  );
}

// Separate Component for the Runner to keep code clean
function RunnerSVG({ color = "white", glow = false }) {
  return (
    <svg 
      width="180" 
      height="180" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ filter: glow ? `drop-shadow(0 0 20px ${color}66)` : 'none' }}
    >
      {/* Head */}
      <circle cx="15" cy="5" r="2" fill={color} />
      {/* Torso/Body */}
      <path 
        d="M13 7L10 11L11 15" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Front Leg */}
      <path 
        d="M10 11L7 14L8 18" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ animation: 'pump 0.6s ease-in-out infinite' }}
      />
      {/* Back Leg */}
      <path 
        d="M10 11L13 14L12 19" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ animation: 'pump 0.6s ease-in-out infinite reverse' }}
      />
      {/* Arms */}
      <path 
        d="M13 8L16 11L14 14" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M13 8L10 9L8 11" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
