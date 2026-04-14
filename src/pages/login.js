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
    <div className="min-h-screen bg-[#051e34] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#039be5] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#039be5] rounded-full blur-[150px] opacity-10" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#039be5] rounded-3xl shadow-xl shadow-[#039be5]/40 mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white text-4xl font-black italic">P</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            PATHFit <span className="text-[#039be5]">Pro</span>
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">
            Physical Activity Towards Health & Fitness
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white/20">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#051e34] tracking-tight">
              {isSigningUp ? 'Create Student Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {isSigningUp ? 'Join the fitness tracking portal.' : 'Sign in to continue your progress.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                placeholder="student@university.edu"
                className="fitness-input !text-left !text-base"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="fitness-input !text-left !text-base"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full !py-5 !rounded-2xl mt-4 flex items-center justify-center gap-3 text-base"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>{isSigningUp ? 'Register Now' : 'Authorize Access'}</span>
                  <span className="text-xl">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button 
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="text-sm font-bold text-[#039be5] hover:text-[#051e34] transition-colors uppercase tracking-widest"
            >
              {isSigningUp ? 'Already Registered? Log In' : 'No account? Create one'}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-white/30 uppercase tracking-[0.5em]">
          Institutional Portal &copy; 2026
        </p>
      </div>
    </div>
  );
}
