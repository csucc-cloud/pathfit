import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  // 100% Preserved Logic & State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSigningUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/profile');
    }
  };

  return (
    // Background: fb-navy
    <div className="min-h-screen bg-fb-navy flex items-center justify-center p-4 md:p-10 font-sans relative overflow-hidden">
      
      {/* Aesthetic "Glassmorphism" Container 
        We use rounded-[3rem] and a border for that floating effect.
        The animation makes it fade and float up on load.
      */}
      <div className="bg-white rounded-[3rem] shadow-[0_15px_100px_rgba(0,0,0,0.1)] border border-white/20 w-full max-w-7xl flex overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* --- LEFT COLUMN: The Interactive Form --- */}
        <div className="w-full md:w-1/3 p-10 md:p-16 flex flex-col justify-center">
          
          {/* Top Brand Area */}
          <div className="flex items-center gap-3 mb-10 group">
            <div className="w-12 h-12 bg-fb-blue rounded-2xl shadow-lg shadow-fb-blue/40 flex items-center justify-center text-white text-3xl font-black italic transform transition-transform group-hover:rotate-6">P</div>
            <div>
              <h1 className="text-2xl font-black text-fb-navy tracking-tight leading-none">PATHFit <span className="text-fb-blue">Pro</span></h1>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest opacity-80 mt-1">Curriculum Management Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-fb-navy tracking-tight">
              {isSigningUp ? 'Join the Community' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {isSigningUp ? 'Register your student credentials.' : 'Please sign in to your training logs.'}
            </p>
          </div>

          {/* Form with your handleAuth logic */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Student Email Address</label>
              <input
                type="email"
                placeholder="name@university.edu"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-fb-blue focus:ring-4 focus:ring-fb-blue/10 outline-none transition-all"
                value={email} // Preserved State
                onChange={(e) => setEmail(e.target.value)} // Preserved State
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Secret Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-fb-blue focus:ring-4 focus:ring-fb-blue/10 outline-none transition-all"
                value={password} // Preserved State
                onChange={(e) => setPassword(e.target.value)} // Preserved State
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-fb-blue text-white font-black py-5 rounded-2xl shadow-lg shadow-fb-blue/20 hover:bg-[#0288d1] active:scale-95 transition-all uppercase tracking-widest text-xs mt-4 border-b-4 border-[#01579b]"
            >
              {loading ? (
                <span className="animate-pulse flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-white/40 animate-ping"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSigningUp ? 'REGISTER NOW' : 'AUTHORIZE ACCESS'}
                  <span className="text-lg">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Toggle Button - Preserved Logic */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="text-[10px] font-black text-fb-blue hover:text-fb-navy transition-colors uppercase tracking-[0.2em]"
            >
              {isSigningUp ? 'Already have an account? Login' : 'New student? Create an account'}
            </button>
          </div>
        </div>

        {/* --- RIGHT COLUMN: The Visual Hero --- */}
        <div className="hidden md:flex md:w-2/3 bg-fb-navy relative overflow-hidden items-end p-16 animate-in fade-in duration-1000 delay-100">
          
          {/* Decorative "Gradient Wave" Element (Recreating image_2.png) */}
          <div className="absolute top-0 right-0 left-[-20%] bottom-0 flex scale-[1.5]">
            <div className="w-2/3 h-full bg-fb-blue rounded-full blur-[150px] opacity-20 -translate-x-[20%]" />
            <div className="w-1/2 h-full bg-[#f4ebd1]/40 rounded-full blur-[150px] translate-x-[40%]" />
          </div>
          
          <div className="z-10 text-white animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <h2 className="text-5xl font-black italic tracking-tighter leading-none">Welcome.</h2>
            <p className="text-sm text-white/70 max-w-sm mt-3 font-medium">
              Please initialize your Physical Activity Towards Health & Fitness profile to access the Phase 1 Pre-Test and weekly training logs.
            </p>
          </div>
          
          {/* Subtle footer branding */}
          <p className="absolute bottom-6 right-6 text-[10px] font-bold text-white/30 uppercase tracking-[0.5em]">
            SYSTEM V1.0 &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
