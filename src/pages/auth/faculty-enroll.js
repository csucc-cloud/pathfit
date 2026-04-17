// src/pages/auth/faculty-enroll.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Activity, 
  Mail, 
  Lock, 
  User, 
  IdCard, 
  Briefcase 
} from 'lucide-react';

export default function InstructorRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // For transition out
  
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    fullName: '',
    department: 'PE Department',
  });

  // Handle navigation back to login with animation
  const handleBackToLogin = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('instructors')
        .insert([{
          id: authData.user.id,
          employee_id: formData.employeeId,
          full_name: formData.fullName,
          department: formData.department
        }]);

      if (profileError) {
        alert("Auth created, but Instructor record failed: " + profileError.message);
      } else {
        alert("Instructor Account Verified!");
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
        .athlete-core { animation: friction-shake 0.1s linear infinite; position: relative; z-index: 20; }
        .shred-layer { position: absolute; top: 0; left: 0; animation: shred-trail 0.4s linear infinite; pointer-events: none; z-index: 10; }
        .delay-shred-1 { animation-delay: 0.05s; }
        .delay-shred-2 { animation-delay: 0.12s; opacity: 0.4; }
      `}</style>

      <div className="bg-white w-full h-screen md:h-auto md:max-w-[1100px] md:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-0 md:border border-gray-100 flex relative overflow-hidden">
        
        {/* ANIMATION COLUMN (The Runner) */}
        {/* Since we come from Login, the runner starts on the LEFT (left-0) */}
        <div className={`hidden md:flex absolute top-0 w-1/2 h-full bg-[#0A0F1E] z-40 items-center justify-center overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isExiting ? 'left-1/2' : 'left-0'}`}>
          <div className="absolute w-[80%] h-[80%] bg-fbOrange/10 rounded-full blur-[120px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-[340px] h-[340px]">
              <img src="/components/runner.png" className="shred-layer delay-shred-1 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="shred-layer delay-shred-2 w-full h-full object-contain mix-blend-screen" alt="" />
              <img src="/components/runner.png" className="athlete-core w-full h-full object-contain drop-shadow-[0_0_60px_rgba(255,107,0,0.5)]" alt="Runner" />
            </div>
            <div className="mt-8 text-center">
              <p className="text-fbOrange font-black italic tracking-[0.3em] text-sm uppercase">Faculty Access</p>
              <p className="text-white/20 text-[10px] font-bold uppercase mt-2 tracking-widest">Authorized Personnel Only</p>
            </div>
          </div>
          <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:30px_30px]" />
        </div>

        {/* FORM COLUMN */}
        <div className={`w-full md:w-1/2 p-10 md:p-16 ml-auto flex flex-col justify-between relative z-30 bg-white transition-all duration-[800ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
          <div className="animate-entrance">
            <button 
              onClick={handleBackToLogin} 
              className="flex items-center gap-2 text-gray-400 hover:text-fbOrange mb-8 font-bold text-xs uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="bg-fbNavy p-3 rounded-2xl shadow-xl">
                <ShieldCheck className="text-fbOrange w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-fbNavy uppercase leading-tight italic">Faculty <span className="text-fbOrange">Portal</span></h1>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Instructor Enrollment</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 animate-entrance delay-1">
            <div className="relative group">
              <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <input type="text" placeholder="Employee ID (e.g. EMP-2026)" className="w-full pl-11 pr-4 py-4 bg-fbGray/10 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-fbOrange/20 transition-all text-fbNavy" 
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})} required />
            </div>
            
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <input type="text" placeholder="Full Name (with Titles)" className="w-full pl-11 pr-4 py-4 bg-fbGray/10 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-fbOrange/20 transition-all text-fbNavy" 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
            </div>

            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <select className="w-full pl-11 pr-4 py-4 bg-fbGray/10 rounded-2xl outline-none font-bold text-sm text-fbNavy focus:ring-2 focus:ring-fbOrange/20 transition-all appearance-none"
                onChange={(e) => setFormData({...formData, department: e.target.value})}>
                <option value="PE Department">PE Department</option>
                <option value="College of Sports Science">Recreation Office</option>
                <option value="Athletics Office">Sports Office</option>
              </select>
            </div>

            <div className="py-2 flex items-center gap-4">
              <div className="h-[1px] bg-gray-100 flex-1" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Security Credentials</span>
              <div className="h-[1px] bg-gray-100 flex-1" />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <input type="email" placeholder="Faculty Email" className="w-full pl-11 pr-4 py-4 bg-fbGray/10 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-fbOrange/20 transition-all text-fbNavy" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-fbOrange" />
              <input type="password" placeholder="Secure Password" className="w-full pl-11 pr-4 py-4 bg-fbGray/10 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-fbOrange/20 transition-all text-fbNavy" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-fbNavy text-white font-black py-4 rounded-2xl shadow-xl hover:bg-fbOrange transition-all transform active:scale-95 flex items-center justify-center gap-3 tracking-widest text-xs uppercase">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Activity className="w-4 h-4" />}
              {loading ? 'Verifying...' : 'Verify Faculty Access'}
            </button>
          </form>

          <div className="mt-8 text-center animate-entrance delay-2">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Institutional Verification System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
