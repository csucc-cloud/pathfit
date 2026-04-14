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
    <div style={{ backgroundColor: '#051e34' }} className="min-h-screen flex items-center justify-center p-4 md:p-12">
      {/* Main Container */}
      <div className="flex w-full max-w-6xl min-h-[600px] bg-white rounded-[2rem] overflow-hidden shadow-2xl flex-col md:flex-row">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#051e34] italic">P</h1>
            <h2 className="text-2xl font-black text-[#051e34] mt-4 tracking-tighter uppercase">PATHFit Pro</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Curriculum Management</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#039be5] outline-none font-bold"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Password</label>
              <input 
                type="password" 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#039be5] outline-none font-bold"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#039be5] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#0288d1] transition-all shadow-lg"
            >
              {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Login')}
            </button>
          </form>

          <button 
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="mt-6 text-[10px] font-black text-[#039be5] uppercase tracking-widest hover:text-[#051e34]"
          >
            {isSigningUp ? 'Back to Login' : 'Create an Account'}
          </button>
        </div>

        {/* Right Side: The Visual Wave */}
        <div className="hidden md:flex flex-1 relative bg-[#051e34] items-center p-16 overflow-hidden">
          {/* Wave Decorative Background */}
          <div className="absolute inset-0 opacity-40" style={{
            background: 'radial-gradient(circle at 0% 0%, #039be5 0%, transparent 50%), radial-gradient(circle at 100% 100%, #f4ebd1 0%, transparent 50%)'
          }}></div>
          
          <div className="relative z-10">
            <h2 className="text-6xl font-black text-white italic leading-none">Welcome.</h2>
            <p className="text-white/60 mt-4 max-w-xs font-medium leading-relaxed">
              Initialize your Physical Activity profile to begin your Phase 1 training.
            </p>
          </div>
          <div className="absolute bottom-8 right-8 text-[10px] font-bold text-white/20 tracking-[0.5em] uppercase">
            PATHFit © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
