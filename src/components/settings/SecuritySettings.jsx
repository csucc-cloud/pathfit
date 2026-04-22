import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  ShieldCheck, Lock, Smartphone, LogOut, 
  AlertCircle, CheckCircle2, Loader2, KeyRound,
  ShieldAlert, Fingerprint, History, Globe,
  RefreshCcw, Eye, EyeOff, ShieldQuestion,
  Copy, Download, ClipboardCheck, SmartphoneNfc,
  Mail, BookOpen, GraduationCap, UserCheck,
  FileLock2, Zap, MonitorX, Network,
  Info
} from 'lucide-react';

export default function SecuritySettings({ user }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);
  
  // Existing States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginHistory, setLoginHistory] = useState([
    { id: 1, device: 'Chrome on MacOS', location: 'Davao City, PH', date: 'Active Now', current: true },
    { id: 2, device: 'Safari on iPhone 15', location: 'Davao City, PH', date: '2 hours ago', current: false },
    { id: 3, device: 'Edge on Windows', location: 'Manila, PH', date: 'April 20, 2026', current: false },
  ]);

  // Contextualized Academic Features States
  const [gradePrivacy, setGradePrivacy] = useState(true); // Feature 1: Grade Privacy
  const [sessionTimeout, setSessionTimeout] = useState('30'); // Feature 2: Academic Session Timeout
  const [loginAlerts, setLoginAlerts] = useState(true); // Feature 3: Security Notifications
  const [ferpaMode, setFerpaMode] = useState(false); // Feature 4: Student Data Privacy Mode
  const [restrictIP, setRestrictIP] = useState(false); // Feature 5: IP Restriction (Campus Only)
  const [examMode, setExamMode] = useState(false); // Feature 6: Proctoring/Exam Security
  const [autoLock, setAutoLock] = useState(true); // Feature 7: Auto-lock on Inactivity
  const [recoveryCodes] = useState(['PATH-FIT-2026-X99', 'LMS-SEC-8821-Q12', 'ACAD-SAFE-4421-P01', 'PROF-LOG-9920-Z55']);

  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return setMessage({ type: 'error', text: 'New passwords do not match.' });
    if (passwords.new.length < 6) return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ new: '', confirm: '' });
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  };

  const handleLogoutOthers = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Signed out of all other sessions.' });
      setLoginHistory(prev => prev.filter(h => h.current));
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
    finally { setLoading(false); }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. PASSWORD MANAGEMENT */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <KeyRound size={120} className="text-fbNavy" />
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-fbNavy/5 rounded-2xl text-fbNavy">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Security Credentials</h3>
            <p className="text-sm text-slate-500 font-medium">Update your password to keep your account safe.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.2rem] py-3.5 px-5 text-sm focus:bg-white focus:ring-4 focus:ring-fbNavy/5 transition-all outline-none"
                placeholder="New password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fbNavy transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Confirm Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              required
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.2rem] py-3.5 px-5 text-sm focus:bg-white focus:ring-4 focus:ring-fbNavy/5 transition-all outline-none"
              placeholder="Confirm new password"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
            {message.text && (
              <div className={`flex items-center gap-2 text-xs font-bold ${message.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                {message.type === 'error' ? <AlertCircle size={14}/> : <CheckCircle2 size={14}/>}
                {message.text}
              </div>
            )}
            <button disabled={loading} className="ml-auto px-10 py-3.5 bg-fbNavy text-white rounded-2xl text-xs font-bold hover:shadow-xl hover:shadow-fbNavy/20 transition-all active:scale-95 disabled:opacity-50">
              {loading ? <RefreshCcw className="animate-spin" size={16} /> : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* 2. ACADEMIC PRIVACY & DATA (Contextualized Features) */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-fbOrange/5 rounded-2xl text-fbOrange">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Academic Privacy Settings</h3>
            <p className="text-sm text-slate-500 font-medium">Manage how student data and grades are handled.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Feature 1: Grade Privacy */}
          <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-fbNavy text-white rounded-lg"><GraduationCap size={18}/></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Restrict Grade Visibility</p>
                <p className="text-xs text-slate-500">Prevent students from seeing class averages or peer rankings.</p>
              </div>
            </div>
            <button onClick={() => setGradePrivacy(!gradePrivacy)} className={`w-12 h-6 rounded-full transition-colors relative ${gradePrivacy ? 'bg-fbNavy' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${gradePrivacy ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Feature 4: FERPA Mode */}
          <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500 text-white rounded-lg"><FileLock2 size={18}/></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Enable Data Privacy Mode (FERPA)</p>
                <p className="text-xs text-slate-500">Mask student PII (Personally Identifiable Information) in exports.</p>
              </div>
            </div>
            <button onClick={() => setFerpaMode(!ferpaMode)} className={`w-12 h-6 rounded-full transition-colors relative ${ferpaMode ? 'bg-fbNavy' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${ferpaMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Feature 8: Automatic Logout Duration */}
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-200 text-slate-600 rounded-lg"><Zap size={18}/></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Academic Session Timeout</p>
                <p className="text-xs text-slate-500">Auto-logout duration for shared faculty computers.</p>
              </div>
            </div>
            <select 
              value={sessionTimeout} 
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-fbNavy/10"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. TWO-FACTOR & RECOVERY */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-fbNavy/5 rounded-2xl text-fbNavy">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-500 font-medium">Add an extra layer of security to your faculty account.</p>
            </div>
          </div>
          <button 
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${twoFactorEnabled ? 'bg-fbNavy' : 'bg-slate-200'}`}
          >
            <span className={`${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="mt-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in zoom-in-95">
             <div className="flex items-center gap-2 mb-4 text-fbNavy font-bold text-[10px] uppercase tracking-widest">
                <ShieldQuestion size={14}/> Recovery Backup Codes
             </div>
             <div className="grid grid-cols-2 gap-2 mb-4">
                {recoveryCodes.map(code => (
                  <div key={code} className="bg-white p-3 rounded-xl border border-slate-200 text-center text-xs font-mono font-bold text-slate-600">{code}</div>
                ))}
             </div>
             <div className="flex gap-2">
                <button onClick={copyCodes} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                  {copied ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14}/>} {copied ? "Copied" : "Copy Codes"}
                </button>
             </div>
          </div>
        )}
      </section>

      {/* 4. ADVANCED SYSTEM SECURITY (Additional Academic Features) */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-fbNavy/5 rounded-2xl text-fbNavy">
            <MonitorX size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Advanced System Security</h3>
            <p className="text-sm text-slate-500 font-medium">Specialized controls for examinations and faculty access.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 5: IP Restriction */}
          <button onClick={() => setRestrictIP(!restrictIP)} className={`p-5 rounded-3xl border text-left transition-all ${restrictIP ? 'bg-fbNavy border-fbNavy text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}>
            <Network size={20} className={restrictIP ? 'text-fbOrange' : 'text-slate-400'}/>
            <p className="mt-3 text-sm font-bold">Campus IP Restriction</p>
            <p className={`text-[10px] mt-1 ${restrictIP ? 'text-white/70' : 'text-slate-400'}`}>Only allow logins from recognized Campus WiFi/Networks.</p>
          </button>

          {/* Feature 6: Exam Mode Security */}
          <button onClick={() => setExamMode(!examMode)} className={`p-5 rounded-3xl border text-left transition-all ${examMode ? 'bg-fbOrange border-fbOrange text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}>
            <UserCheck size={20} className={examMode ? 'text-fbNavy' : 'text-slate-400'}/>
            <p className="mt-3 text-sm font-bold">Proctoring Enforcement</p>
            <p className={`text-[10px] mt-1 ${examMode ? 'text-white/70' : 'text-slate-400'}`}>Require students to enable 2FA before accessing Final Exams.</p>
          </button>
        </div>
      </section>

      {/* 5. LOGIN SESSIONS & ACTIVITY */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <History size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Login Activity</h3>
              <p className="text-sm text-slate-500 font-medium">History of access to your instructor dashboard.</p>
            </div>
          </div>
          <button onClick={handleLogoutOthers} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest px-4 py-2 hover:bg-red-50 rounded-xl transition-all">
            Sign out all others
          </button>
        </div>
        <div className="space-y-3">
          {loginHistory.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-xl shadow-sm ${session.current ? 'bg-fbNavy text-white' : 'bg-white text-slate-400 group-hover:text-fbNavy'}`}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase rounded-md border border-emerald-100">Current</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-1"><Globe size={10} /> {session.location}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{session.date}</span>
                  </div>
                </div>
              </div>
              {!session.current && <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><LogOut size={16} /></button>}
            </div>
          ))}
        </div>
      </section>

      {/* DANGER ZONE */}
      <section className="bg-red-50/30 rounded-[2.5rem] p-8 border border-red-100 shadow-sm mt-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 tracking-tight">Danger Zone</h3>
            <p className="text-sm text-red-700/70 font-medium">Permanently delete your instructor account and all data.</p>
          </div>
        </div>
        <p className="text-xs text-red-600/60 mb-6 max-w-xl font-medium">
          Warning: This will permanently delete your profile, sections, and historical student attendance/grades.
        </p>
        <button className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
          Delete Account
        </button>
      </section>
    </div>
  );
}
