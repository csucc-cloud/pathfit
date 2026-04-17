// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

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
        // This ensures students land on the 8-week timeline hub
        router.push('/dashboard'); 
      }
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

        {/* Footer Note with Triple-Tap '1' Secret */}
        <div className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest font-black flex justify-center items-center px-1 select-none">
          <span>Student Portal v1.</span>
          <button 
            type="button"
            onClick={handleSecretTap}
            className="hover:text-fbOrange transition-colors cursor-default outline-none"
          >
            1
          </button>
        </div>
      </div>
    </div>
  );
}
