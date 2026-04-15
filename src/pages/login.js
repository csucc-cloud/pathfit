import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    // Only performing Sign In here since Sign Up is moved to a dedicated page
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      router.push('/practicum/1');
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
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{loading ? 'Processing...' : 'Login'}</span>
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-100"></div>
        </div>

        {/* Teleport to Register Page */}
        <button 
          onClick={() => router.push('/auth/register')}
          className="text-xs font-bold text-fbOrange hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          New student? Create an account
        </button>

        {/* Footer Note */}
        <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest font-black">
          Student Portal v1.1
        </p>
      </div>
    </div>
  );
}
