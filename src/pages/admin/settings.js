import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Camera,
  Save,
  Check,
  Settings,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants for the whole page
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.6 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    department: '',
    instructor_id: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, department, student_id_number')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            email: user.email || '',
            department: data.department || '',
            instructor_id: data.student_id_number || '' 
          });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          department: profile.department,
          student_id_number: profile.instructor_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Loader2 className="text-fbOrange" size={48} />
        </motion.div>
        <p className="mt-4 font-black text-fbNavy uppercase italic tracking-[0.3em] animate-pulse text-[10px]">Accessing Secure Core...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-12 lg:pt-8 pb-20 px-6 md:px-10 lg:pl-12 max-w-[1600px] mx-auto overflow-hidden"
    >
      {/* HEADER SECTION */}
      <motion.header 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl shadow-fbNavy/5 border border-white mb-16"
      >
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ rotate: 0, scale: 1.1 }}
            className="bg-fbNavy p-4 rounded-3xl shadow-2xl shadow-fbNavy/20 rotate-3 transition-all duration-500"
          >
            <Settings className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black text-fbNavy tracking-tight italic uppercase leading-none">
              Account <span className="text-fbOrange">Matrix</span>
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-fbOrange' : 'bg-green-500'}`}></span>
              </span>
              {loading ? 'Committing Data...' : 'Biometric Link Active'}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* PROFILE PREVIEW CARD */}
        <motion.div variants={itemVariants} className="space-y-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-fbOrange/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full bg-fbGray rounded-[35px] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                 <User size={60} className="text-gray-300" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 p-3 bg-fbNavy text-white rounded-2xl shadow-lg hover:bg-fbOrange transition-colors"
              >
                <Camera size={18} />
              </motion.button>
            </div>
            <h3 className="text-xl font-black text-fbNavy uppercase italic relative z-10">{profile.full_name || 'Instructor'}</h3>
            <p className="text-[10px] font-bold text-fbOrange uppercase tracking-widest relative z-10">{profile.department || 'Faculty'}</p>
          </motion.div>

          <nav className="bg-white rounded-[40px] p-4 border border-gray-100 shadow-sm space-y-2">
            <SettingsTab icon={<User size={18} />} label="Profile Info" active />
            <SettingsTab icon={<Shield size={18} />} label="Security" />
            <SettingsTab icon={<Bell size={18} />} label="Notifications" />
          </nav>
        </motion.div>

        {/* MAIN FORM AREA */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[45px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <h3 className="font-black text-fbNavy uppercase italic text-lg mb-8 flex items-center gap-3">
              <User className="text-fbOrange" /> Personal Registry
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" value={profile.full_name} onChange={(v) => setProfile({...profile, full_name: v})} />
              <InputGroup label="Instructor ID" value={profile.instructor_id} onChange={(v) => setProfile({...profile, instructor_id: v})} />
              <InputGroup label="Email Address" value={profile.email} disabled />
              <InputGroup label="Department" value={profile.department} onChange={(v) => setProfile({...profile, department: v})} />
            </div>

            <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase max-w-xs leading-relaxed">
                Ensure your Instructor ID matches your faculty records to avoid registry conflicts.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-fbNavy text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-fbOrange transition-all shadow-xl shadow-fbNavy/10 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : saved ? <><Check size={18}/> Updated</> : <><Save size={18}/> Commit Changes</>}
              </motion.button>
            </div>
          </div>

          {/* SECURITY SECTION */}
          <motion.div 
            variants={itemVariants}
            className="bg-fbNavy rounded-[45px] p-10 text-white relative overflow-hidden group"
          >
            <div className="relative z-10">
              <h3 className="font-black uppercase italic text-lg mb-6 flex items-center gap-3 text-fbOrange">
                <Lock size={20} /> Security Gateway
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                <motion.button whileHover={{ x: 5 }} className="bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Reset Password
                </motion.button>
                <motion.button whileHover={{ x: 5 }} className="bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Enable 2FA
                </motion.button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-fbOrange/20 transition-colors duration-700" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SettingsTab({ icon, label, active }) {
  return (
    <motion.button 
      whileHover={{ x: 5 }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs transition-all ${active ? 'bg-fbGray text-fbNavy shadow-inner' : 'text-gray-400 hover:text-fbNavy'}`}
    >
      <span className={active ? 'text-fbOrange' : ''}>{icon}</span>
      {label}
    </motion.button>
  );
}

function InputGroup({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-6 py-4 bg-fbGray/20 border border-transparent rounded-2xl text-xs font-bold text-fbNavy outline-none focus:bg-white focus:border-fbOrange/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed italic' : ''}`}
      />
    </div>
  );
}
