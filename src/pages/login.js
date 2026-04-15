// src/pages/login.js
import React from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();

  const handleLogin = async () => {
    // Basic guard: Check if supabase is initialized properly
    if (!supabase) {
      console.error("Supabase client not initialized.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        // Redirecting specifically to Practicum 1 per your requirement
        redirectTo: `${window.location.origin}/practicum/1` 
      }
    });
  };

  return (
    <div className="min-h-screen bg-fbGray flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-gray-50">
        
        {/* Brand Logo - Orange Firebase Aesthetic */}
        <div className="w-16 h-16 bg-fbOrange rounded-2xl rotate-3 shadow-lg mx-auto mb-6 flex items-center justify-center transition-transform hover:rotate-0">
          <span className="text-white text-3xl font-bold">P</span>
        </div>

        {/* Branding Text */}
        <h1 className="text-2xl font-extrabold text-fbNavy mb-2 tracking-tight">
          PATHFit <span className="text-fbOrange">Pro</span>
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Sign in to track your university fitness progress.
        </p>
        
        {/* Auth Button */}
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3 rounded-xl font-bold text-fbNavy hover:bg-gray-50 hover:border-fbOrange/20 transition-all active:scale-95 shadow-sm"
        >
          {/* Using a Google Icon placeholder that matches the UI aesthetic */}
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
            className="w-5 h-5" 
            alt="Google Logo" 
          />
          <span className="bg-clip-text">Login with Google</span>
        </button>

        {/* Footer Note */}
        <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest font-black">
          Student Portal v1.0
        </p>
      </div>
    </div>
  );
}
