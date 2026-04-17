// src/pages/register.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient'; // Path from your snippet
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  ChevronLeft, 
  Zap,
  Activity,
  GraduationCap,
  Hash,
  Fingerprint
} from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // Controls the reverse slide
  
  // Kept your exact formData structure
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

  // NEW: Navigation handler to trigger animation before leaving
  const handleBackToLogin = () => {
    setIsExiting(true); // Slide the runner back to the right
    setTimeout(() => {
      router.push('/'); // Navigate back to login.js after animation
    }, 800);
  };

  // Kept your exact registration logic
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
        router.push('/'); 
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
        .athlete-core { animation: friction-shake 0.12s linear infinite; position: relative; z-index: 20; }
        .shred-layer { position: absolute; top: 0; left: 0; animation: shred-trail 0.4s linear infinite; pointer-events: none; z-index: 10; }
        .delay-shred-1 { animation-delay: 0.05s; }
        .delay-shred-2 { animation-delay: 0.12s; opacity: 0.4; }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1200px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-0 md:border border-gray-100 flex flex-row-reverse relative overflow-hidden">
        
        {/* FORM COLUMN */}
        <div className={`w-full md:w-[50%] p-8 md:p-12 flex flex-col justify-between relative z-30 bg-white overflow-y-auto custom-scrollbar transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
          <div className="animate-entrance">
            <button 
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-gray-400 hover:text-fbOrange font-bold text-xs mb-6 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> BACK TO LOGIN
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-fbNavy rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="text-fbOrange w-5 h-5" />
              </div>
              <h2 className="text-fbNavy font-black tracking-tighter text-lg italic uppercase">PATH<span className="text-fbOrange">FIT</span></h2>
            </div>

            <h1 className="text-3xl font-black text-fbNavy mb-2">Create Athlete Profile</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Student Registration Portal</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3 animate-entrance delay-1">
            {/* Row 1: Student ID & Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative group">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
                <input type="text" placeholder="Student ID" required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})} />
              </div>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
                <input type="text" placeholder="Full Name" required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
            </div>

            {/* Row 2: Age, Sex, Section */}
            <div className="grid grid-cols-3 gap-3">
              <input type="number" placeholder="Age" className="w-full px-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                onChange={(e) => setFormData({...formData, age: e.target.value})} />
              
              <select className="w-full px-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-bold text-fbNavy text-sm appearance-none"
                onChange={(e) => setFormData({...formData, sex: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <div className="relative group">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
                <input type="text" placeholder="Section" className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                  onChange={(e) => setFormData({...formData, sectionCode: e.target.value})} />
              </div>
            </div>

            {/* Row 3: College & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative group">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
                <input type="text" placeholder="College (e.g. CAS)" required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                  onChange={(e) => setFormData({...formData, college: e.target.value})} />
              </div>
              <input type="text" placeholder="Course (e.g. BSIT)" className="w-full px-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                onChange={(e) => setFormData({...formData, course: e.target.value})} />
            </div>

            <div className="py-2 flex items-center gap-4">
              <div className="h-[1px] bg-gray-100 flex-1" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Security</span>
              <div className="h-[1px] bg-gray-100 flex-1" />
            </div>

            {/* Row 4: Email & Password */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <input type="email" placeholder="Email Address" required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <input type="password" placeholder="Password" required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-fbGray/10 border-2 border-transparent focus:border-fbOrange/20 outline-none font-semibold text-fbNavy text-sm" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-fbOrange text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-fbNavy transition-all active:scale-95 shadow-xl shadow-fbOrange/20 flex items-center justify-center gap-3 mt-4">
              {loading ? <Loader2 className="animate-spin" /> : <Activity size={18} />}
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
          </form>
        </div>

        {/* ANIMATION COLUMN (The Runner) */}
        {/* Starts on the LEFT (left-0) because the login page just pushed it here */}
        {/* Slides to the RIGHT (left-1/2) only if handleBackToLogin is clicked */}
        <div className={`hidden md:flex absolute top-0 w-1/2 h-full bg-[#0A0F1E] z-40 items-center justify-center overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isExiting ? 'left-1/2' : 'left-0'}`}>
          <div className="absolute w-[80%] h-[80%] bg-fbOrange/10 rounded-full blur-[120px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-[400px] h-[400px]">
              <img src="/components/runner.png" className="shred-layer delay-shred-1 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="shred-layer delay-shred-2 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="athlete-core w-full h-full object-contain drop-shadow-[0_0_60px_rgba(255,107,0,0.5)]" alt="Runner" />
            </div>
            <div className="mt-8 text-center animate-entrance delay-2">
              <p className="text-fbOrange font-black italic tracking-[0.3em] text-sm uppercase">Join the race</p>
              <p className="text-white/20 text-[10px] font-bold uppercase mt-2 tracking-widest">PathFit Student Portal v1.0</p>
            </div>
          </div>
          <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>
      </div>
    </div>
  );
}
