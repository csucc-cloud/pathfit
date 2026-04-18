import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Camera,
  Save,
  Mail,
  Smartphone,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    department: 'PE Department',
    instructor_id: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user.email || '',
          department: data.department || 'PE Department',
          instructor_id: data.student_id_number || '' // Reusing the column for ID
        });
      }
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    // Add update logic here
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <>
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-fbNavy uppercase italic tracking-tighter">
          Admin <span className="text-fbOrange">Settings</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
          Manage your account security and faculty profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: NAVIGATION & PROFILE PREVIEW */}
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full bg-fbGray rounded-[35px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                 <User size={60} className="text-gray-300" />
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-fbNavy text-white rounded-2xl shadow-lg hover:bg-fbOrange transition-colors">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black text-fbNavy uppercase italic">{profile.full_name || 'Instructor'}</h3>
            <p className="text-[10px] font-bold text-fbOrange uppercase tracking-widest">{profile.department}</p>
          </div>

          <nav className="bg-white rounded-[40px] p-4 border border-gray-100 shadow-sm space-y-2">
            <SettingsTab icon={<User size={18} />} label="Profile Info" active />
            <SettingsTab icon={<Shield size={18} />} label="Security" />
            <SettingsTab icon={<Bell size={18} />} label="Notifications" />
          </nav>
        </div>

        {/* RIGHT COLUMN: ACTUAL FORMS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROFILE SECTION */}
          <div className="bg-white rounded-[45px] p-10 border border-gray-100 shadow-sm">
            <h3 className="font-black text-fbNavy uppercase italic text-lg mb-8 flex items-center gap-3">
              <User className="text-fbOrange" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" value={profile.full_name} placeholder="e.g. Coach Carter" />
              <InputGroup label="Instructor ID" value={profile.instructor_id} placeholder="e.g. INST-2024-001" />
              <InputGroup label="Email Address" value={profile.email} placeholder="email@university.edu" disabled />
              <InputGroup label="Department" value={profile.department} placeholder="PE Department" />
            </div>

            <div className="mt-10 pt-10 border-t border-gray-50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase max-w-xs">
                Ensure your Instructor ID is correct for student section enrollment.
              </p>
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-3 bg-fbNavy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-fbOrange transition-all shadow-xl shadow-fbNavy/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : saved ? <><Check size={18}/> Updated</> : <><Save size={18}/> Save Changes</>}
              </button>
            </div>
          </div>

          {/* SECURITY QUICK ACTIONS */}
          <div className="bg-fbNavy rounded-[45px] p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black uppercase italic text-lg mb-6 flex items-center gap-3 text-fbOrange">
                <Lock size={20} /> Security
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                <button className="bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                  Change Password
                </button>
                <button className="bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                  Two-Factor Auth
                </button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

        </div>
      </div>
    </>
  );
}

// Sub-components
function SettingsTab({ icon, label, active }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs transition-all ${active ? 'bg-fbGray text-fbNavy' : 'text-gray-400 hover:text-fbNavy hover:bg-fbGray/5'}`}>
      <span className={active ? 'text-fbOrange' : ''}>{icon}</span>
      {label}
    </button>
  );
}

function InputGroup({ label, value, placeholder, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        defaultValue={value} 
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-6 py-4 bg-fbGray/20 border border-transparent rounded-2xl text-xs font-bold text-fbNavy outline-none focus:bg-white focus:border-fbOrange/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}
