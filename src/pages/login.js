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
    <div style={{ backgroundColor: '#051e34', minHeight: '100vh' }} className="flex items-center justify-center p-4 md:p-12">
      <div className="flex w-full max-w-6xl min-h-[600px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex-col md:flex-row border border-white/10">
        
        {/* Left Form */}
        <div className="w-full md:w-2/5 p-10 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-block px-4 py-2 bg-[#039be5] text-white rounded-xl font-black italic text-2xl mb-4">P</div>
            <h2 className="text-3xl font-black text-[#051e34] tracking-tighter uppercase leading-none">PATHFit Pro</h2>
            <p className="text-[10px] text-gray-400 font-bold tracking-[0.3em] mt-2">INSTITUTIONAL PORTAL</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 ml-1">Student Email</label>
              <input 
                type="email" 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#039be5] outline-none font-bold transition-all text-sm"
                placeholder="name@university.edu"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 ml-1">Password</label>
              <input 
                type="password" 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#039be5] outline-none font-bold transition-all text-sm"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#039be5] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#0288d1] transition-all shadow-xl shadow-[#039be5]/20 border-b-4 border-[#01579b]"
            >
              {loading ? 'Authenticating...' : (isSigningUp ? 'Register' : 'Authorize Access')}
            </button>
          </form>

          <button onClick={() => setIsSigningUp(!isSigningUp)} className="mt-8 text-[10px] font-black text-[#039be5] uppercase tracking-widest">
            {isSigningUp ? 'Return to Login' : 'Create New Account'}
          </button>
        </div>

        {/* Right Hero (The Design part) */}
        <div className="hidden md:flex flex-1 relative bg-[#051e34] items-end p-16">
          <div className="absolute inset-0 opacity-50" style={{
            background: 'radial-gradient(circle at 0% 0%, #039be5 0%, transparent 70%), radial-gradient(circle at 100% 100%, #f4ebd1 0%, transparent 70%)'
          }}></div>
          
          <div className="relative z-10 text-white">
            <h2 className="text-7xl font-black italic leading-none mb-4">Welcome.</h2>
            <p className="text-white/60 max-w-xs font-medium text-sm leading-relaxed uppercase tracking-wider">
              Physical Activity Towards Health and Fitness Curriculum Management System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
