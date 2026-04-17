// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  ChevronRight, 
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
        
        /* Aggressive vibrating sprint - looks like high-speed friction */
        @keyframes friction-shake {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(2px, -2px) scale(1.01); }
          75% { transform: translate(-2px, 2px) scale(0.99); }
        }

        /* The Shredded Ghost Trail */
        @keyframes shred-trail {
          0% { transform: translateX(0) skewX(-15deg) scaleX(1); opacity: 0.7; filter: blur(0px); }
          100% { transform: translateX(-400px) skewX(-25deg) scaleX(2.5); opacity: 0; filter: blur(8px); }
        }

        .animate-entrance { animation: entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .athlete-core { 
          animation: friction-shake 0.1s linear infinite; 
          position: relative;
          z-index: 20;
        }

        .shred-layer {
          position: absolute;
          top: 0;
          left: 0;
          animation: shred-trail 0.4s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        
        .delay-shred-1 { animation-delay: 0.05s; }
        .delay-shred-2 { animation-delay: 0.12s; opacity: 0.4; }
        .delay-shred-3 { animation-delay: 0.2s; opacity: 0.2; }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1100px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-0 md:border border-gray-100 flex overflow-hidden">
        
        {/* FORM COLUMN */}
        <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-between relative z-30 bg-white">
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
              <input type="email" placeholder="University Email" required className="w-full pl-12 pr-4 py-4 rounded-2xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 focus:bg-white outline-none transition-all font-semibold text-fbNavy text-sm" onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-fbOrange transition-colors" />
              <input type="password" placeholder="Password" required className="w-full pl-12 pr-4 py-4 rounded-2xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 focus:bg-white outline-none transition-all font-semibold text-fbNavy text-sm" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-fbNavy text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-fbOrange transition-all active:scale-95 shadow-xl shadow-fbNavy/10 hover:shadow-fbOrange/30 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} className="text-fbOrange group-hover:text-white" />}
              {loading ? 'Processing...' : 'Start Session'}
            </button>
          </form>

          <div className="animate-entrance delay-2">
            <button onClick={() => router.push('/auth/register')} className="group text-xs font-bold text-gray-400 hover:text-fbOrange transition-all flex items-center gap-2">
              No account? <span className="underline decoration-2 underline-offset-4 group-hover:text-fbOrange">Create here!</span> <ChevronRight size={14} />
            </button>
            <div className="mt-8 flex items-center gap-4 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              <span>PORTAL V1.0</span>
              <button onClick={handleSecretTap} className="hover:text-fbOrange transition-colors">{tapCount > 0 ? `[${tapCount}]` : '1'}</button>
            </div>
          </div>
        </div>

        {/* HIGH-SPEED ANIMATION COLUMN */}
        <div className="hidden md:flex md:w-[55%] bg-[#0A0F1E] relative items-center justify-center overflow-hidden">
          
          {/* Visual Glow behind athlete */}
          <div className="absolute w-[80%] h-[80%] bg-fbOrange/10 rounded-full blur-[120px]" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* THE ATHLETE WRAPPER */}
            <div className="relative w-[380px] h-[380px]">
              
              {/* THE GHOST SHREDS (Trailing versions of your image) */}
              <img src="/components/runner.png" className="shred-layer delay-shred-1 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="shred-layer delay-shred-2 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="shred-layer delay-shred-3 w-full h-full object-contain mix-blend-screen" alt="" />

              {/* THE ACTUAL ATHLETE */}
              <img 
                src="/components/runner.png" 
                className="athlete-core w-full h-full object-contain drop-shadow-[0_0_60px_rgba(255,107,0,0.5)]" 
                alt="Runner" 
              />
            </div>

            {/* DASHBOARD HUD */}
            <div className="mt-8 flex gap-6 animate-entrance delay-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] min-w-[140px] text-center">
                <p className="text-[10px] text-fbOrange font-black uppercase mb-1">PACE</p>
                <p className="text-white font-bold text-xl italic uppercase">4'12"/KM</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] min-w-[140px] text-center">
                <p className="text-[10px] text-fbOrange font-black uppercase mb-1">CALORIES</p>
                <p className="text-white font-bold text-xl italic uppercase">842 KCAL</p>
              </div>
            </div>
            
            <h3 className="absolute bottom-[-20px] text-white/[0.03] text-[150px] font-black italic uppercase tracking-tighter select-none pointer-events-none">
              ATHLETE
            </h3>
          </div>

          <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>
      </div>
    </div>
  );
                                            }
