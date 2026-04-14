import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
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
    <div className="min-h-screen bg-[#051e34] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows - Provides depth and modern aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#039be5] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#039be5] rounded-full blur-[150px] opacity-10" />

      <div className="w-full max-w-md z-10 transition-all duration-700 ease-out transform">
        {/* Branding Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#039be5] rounded-3xl shadow-2xl shadow-[#039be5]/40 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white text-4xl font-black italic">P</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
            PATHFit <span className="text-[#039be5]">Pro</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 opacity-70">
            Physical Activity Towards Health & Fitness
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-white/10 relative animate-in fade-in zoom-in duration-500">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-[#051e34] tracking-tight">
              {isSigningUp ? 'Join the Portal' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {isSigningUp ? 'Create your student account.' : 'Sign in to track your progress.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Student Email</label>
              <input
                type="email"
                placeholder="student@university.edu"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-[#039be5] focus:ring-4 focus:ring-[#039be5]/10 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-[#039be5] focus:ring-4 focus:ring-[#039be5]/10 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#039be5] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#039be5]/20 hover:bg-[#0288d1] active:scale-95 transition-all uppercase tracking-widest text-xs mt-4 border-b-4 border-[#01579b]"
            >
              {loading ? (
                <span className="animate-pulse italic">Authenticating...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSigningUp ? 'Register Now' : 'Authorize Access'}
                  <span className="text-lg">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="text-[10px] font-black text-[#039be5] hover:text-[#051e34] transition-colors uppercase tracking-[0.2em]"
            >
              {isSigningUp ? 'Already Registered? Log In' : 'No account? Create one'}
            </button>
          </div>
        </div>

        {/* Footer Branding */}
        <p className="text-center mt-10 text-[10px] font-bold text-white/20 uppercase tracking-[0.6em]">
          Institutional Portal © 2026
        </p>
      </div>
    </div>
  );
}
