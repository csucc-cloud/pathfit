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
  ChevronLeft,
  Timer, 
  Flame,
  Zap,
  User,
  Activity,
  Fingerprint,
  GraduationCap
} from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false); // Controls the sliding state
  const [loading, setLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // --- LOGIN STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- REGISTER STATE (Preserving your exact structure) ---
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    fullName: '',
    age: '',
    sex: 'Male',
    course: '',
    college: '', 
    sectionCode: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setTapCount(0), 2000);
    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleSecretTap = () => {
    const nextCount = tapCount + 1;
    if (nextCount === 3) router.push('/auth/faculty-enroll');
    else setTapCount(nextCount);
  };

  // --- ORIGINAL LOGIN LOGIC ---
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

  // --- ORIGINAL REGISTER LOGIC ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { student_id: formData.studentId }
      }
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          student_id: formData.studentId,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          sex: formData.sex,
          course: formData.course,
          college: formData.college, 
          section_code: formData.sectionCode
        }]);

      if (profileError) {
        alert("Auth created, but profile failed: " + profileError.message);
      } else {
        alert("Account Created! You can now log in.");
        setIsRegister(false); // Slide back to login
      }
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
        @keyframes friction-shake {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(2px, -2px) scale(1.01); }
          75% { transform: translate(-2px, 2px) scale(0.99); }
        }
        @keyframes shred-trail {
          0% { transform: translateX(0) skewX(-15deg) scaleX(1); opacity: 0.7; filter: blur(0px); }
          100% { transform: translateX(-400px) skewX(-25deg) scaleX(2.5); opacity: 0; filter: blur(8px); }
        }
        .animate-entrance { animation: entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .athlete-core { animation: friction-shake 0.1s linear infinite; position: relative; z-index: 20; }
        .shred-layer { position: absolute; top: 0; left: 0; animation: shred-trail 0.4s linear infinite; pointer-events: none; z-index: 10; }
        .delay-shred-1 { animation-delay: 0.05s; }
        .delay-shred-2 { animation-delay: 0.12s; opacity: 0.4; }
        .delay-shred-3 { animation-delay: 0.2s; opacity: 0.2; }
        
        /* Sliding Transition */
        .slide-engine { transition: transform 0.8s cubic-bezier(0.85, 0, 0.15, 1); }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1100px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-0 md:border border-gray-100 flex relative overflow-hidden">
        
        {/* THE FORMS WRAPPER (Slides inside the container) */}
        <div className={`flex w-[200%] h-full slide-engine ${isRegister ? '-translate-x-1/2' : 'translate-x-0'}`}>
          
          {/* LOGIN VIEW */}
          <div className="w-1/2 p-10 md:p-16 flex flex-col justify-between relative z-30 bg-white">
            <div className="animate-entrance">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-fbOrange rounded-2xl flex items-center justify-center shadow-lg shadow-fbOrange/30">
                  <LogIn className="text-white w-6 h-6" />
                </div>
                <h2 className="text-fbNavy font-black tracking-tighter text-xl italic uppercase">PATH<span className="text-fbOrange">FIT</span></h2>
              </div>
              <h1 className="text-4xl font-black text-fbNavy mb-4 leading-tight">Push Your <br /><span className="text-fbOrange uppercase tracking-tighter italic">Limits.</span></h1>
              <p className="text-gray-400 text-sm font-medium max-w-xs">Sign in to track your fitness milestones.</p>
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
              <button type="submit" disabled={loading} className="w-full bg-fbNavy text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-fbOrange transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} className="text-fbOrange group-hover:text-white" />}
                {loading ? 'Processing...' : 'Log In'}
              </button>
            </form>

            <div className="animate-entrance delay-2">
              <button onClick={() => setIsRegister(true)} className="group text-xs font-bold text-gray-400 hover:text-fbOrange transition-all flex items-center gap-2">
                No account? <span className="underline decoration-2 underline-offset-4 group-hover:text-fbOrange">Create here!</span> <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* REGISTER VIEW */}
          <div className="w-1/2 p-10 md:p-12 flex flex-col justify-between relative z-30 bg-white overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <button onClick={() => setIsRegister(false)} className="flex items-center gap-2 text-gray-400 hover:text-fbOrange font-bold text-xs mb-6 transition-colors group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO LOGIN
                </button>
                <h1 className="text-3xl font-black text-fbNavy mb-6 leading-tight">Join the <span className="text-fbOrange italic uppercase">Race.</span></h1>
                
                <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Student ID" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, studentId: e.target.value})} required />
                        <input type="text" placeholder="Full Name" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" placeholder="Age" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, age: e.target.value})} />
                        <select className="p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-bold text-sm" onChange={(e) => setFormData({...formData, sex: e.target.value})}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <input type="text" placeholder="Section" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, sectionCode: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="College" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, college: e.target.value})} required />
                        <input type="text" placeholder="Course" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, course: e.target.value})} />
                    </div>
                    <input type="email" placeholder="University Email" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full p-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-sm" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    <button type="submit" disabled={loading} className="w-full bg-fbOrange text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-fbNavy transition-all shadow-xl flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : <Activity size={18} />}
                        {loading ? 'Processing...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
          </div>
        </div>

        {/* HIGH-SPEED ANIMATION COLUMN (The Slider) */}
        <div className={`hidden md:flex absolute top-0 w-1/2 h-full bg-[#0A0F1E] z-40 items-center justify-center overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isRegister ? 'left-0' : 'left-1/2'}`}>
          <div className="absolute w-[80%] h-[80%] bg-fbOrange/10 rounded-full blur-[120px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-[340px] h-[340px]">
              <img src="/components/runner.png" className="shred-layer delay-shred-1 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="shred-layer delay-shred-2 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="athlete-core w-full h-full object-contain drop-shadow-[0_0_60px_rgba(255,107,0,0.5)]" alt="Runner" />
            </div>
            <div className="mt-8 flex gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[20px] text-center min-w-[120px]">
                <p className="text-[10px] text-fbOrange font-black uppercase">PACE</p>
                <p className="text-white font-bold text-lg italic uppercase">4'12"/KM</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[20px] text-center min-w-[120px]">
                <p className="text-[10px] text-fbOrange font-black uppercase">CALORIES</p>
                <p className="text-white font-bold text-lg italic uppercase">842 KCAL</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>

      </div>
    </div>
  );
}
