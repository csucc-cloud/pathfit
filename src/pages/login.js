
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, UserPlus, Chrome, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const handleGoogleLogin = async () => {
    if (!supabase) {
      console.error("Supabase client not initialized.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/practicum/1` 
      }
    });
  };


  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (isSignUp) alert("Account created! You can now log in.");
      else router.push('/practicum/1');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-fbGray flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-50">
        
        {/* Brand Logo - Orange Firebase Aesthetic */}
        <div className="w-16 h-16 bg-fbOrange rounded-2xl rotate-3 shadow-lg mx-auto mb-6 flex items-center justify-center transition-transform hover:rotate-0">
          <LogIn className="text-white w-8 h-8" />
        </div>

        {/* Branding Text */}
        <h1 className="text-2xl font-extrabold text-fbNavy mb-2 tracking-tight">
          PATHFit <span className="text-fbOrange">Portal</span>
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Sign in to track your university fitness progress.
        </p>
        
        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="email" 
              placeholder="University Email" 
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-fbGray/30 text-sm focus:ring-2 focus:ring-fbOrange outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-fbGray/30 text-sm focus:ring-2 focus:ring-fbOrange outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-fbNavy text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}</span>
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-100"></div>
          <span className="px-3 text-[10px] text-gray-300 font-bold uppercase">OR</span>
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        {/* Your Original Auth Button (Google) */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3 rounded-xl font-bold text-fbNavy hover:bg-gray-50 hover:border-fbOrange/20 transition-all active:scale-95 shadow-sm mb-4 text-sm"
        >
          <Chrome className="w-5 h-5 text-fbOrange" />
          <span className="bg-clip-text">Continue with Google</span>
        </button>

        {/* Switch between Sign In / Sign Up */}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs font-bold text-fbOrange hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          {isSignUp ? "Already have an account? Login" : "New student? Create an account"}
        </button>

        {/* Footer Note */}
        <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest font-black">
          Student Portal v1.0
        </p>
      </div>
    </div>
  );
}
