import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout'; // Note the double ../../ to reach components
import { supabase } from '../../lib/supabaseClient';
import { 
  Camera, 
  Edit2, 
  User, 
  MapPin, 
  School, 
  Calendar, 
  Award, 
  CheckCircle2,
  Lock,
  Info,
  Dumbbell,
  Globe
} from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('About');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
        setBio(data?.bio || "Welcome to my PATHFit profile!");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSaveBio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bio })
      .eq('id', user.id);

    if (!error) {
      setIsEditingBio(false);
    } else {
      alert("Error updating bio: " + error.message);
    }
  };

  if (loading) return null;

  return (
    <Layout>
      <main className="bg-[#F0F2F5] min-h-screen pb-12">
        {/* FACEBOOK STYLE HEADER */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-[1250px] mx-auto">
            {/* Cover Photo */}
            <div className="relative h-[200px] md:h-[350px] w-full bg-fbNavy rounded-b-xl overflow-hidden shadow-inner">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            {/* Profile Info Area */}
            <div className="px-4 md:px-12">
              <div className="flex flex-col md:flex-row items-end -mt-12 md:-mt-20 gap-6 mb-4">
                {/* Profile Picture (The Circle) */}
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white bg-fbGray overflow-hidden shadow-md flex items-center justify-center text-6xl font-black text-fbNavy relative z-10">
                  {profile?.full_name?.charAt(0)}
                </div>

                {/* Name and Basic Title */}
                <div className="flex-1 pb-4 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-black text-fbNavy">{profile?.full_name}</h1>
                  <p className="text-gray-500 font-bold">Student Athlete • {profile?.section}</p>
                </div>

                {/* Edit Button */}
                <div className="flex gap-2 mb-6">
                  <button className="bg-fbOrange text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:brightness-110 transition-all">
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* NAVIGATION TABS */}
              <div className="flex items-center gap-2 border-t border-gray-100">
                <button 
                  onClick={() => setActiveTab('About')}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-4 flex items-center gap-2 ${activeTab === 'About' ? 'border-fbOrange text-fbOrange' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  <Info size={18} /> About
                </button>
                <button 
                  onClick={() => setActiveTab('Logs')}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-4 flex items-center gap-2 ${activeTab === 'Logs' ? 'border-fbOrange text-fbOrange' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  <Dumbbell size={18} /> Fitness Logs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="max-w-[1250px] mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR: Intro & Editable Bio */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-black text-fbNavy mb-4">Intro</h2>
                
                {/* Bio Logic */}
                <div className="mb-6">
                  {isEditingBio ? (
                    <div className="space-y-2">
                      <textarea 
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-fbOrange outline-none"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="3"
                        placeholder="Describe yourself..."
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveBio} className="flex-1 bg-fbOrange text-white py-2 rounded-lg text-xs font-bold">Save</button>
                        <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-gray-200 py-2 rounded-lg text-xs font-bold">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3 px-2">"{bio}"</p>
                      <button onClick={() => setIsEditingBio(true)} className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold transition-colors">
                        Edit Bio
                      </button>
                    </div>
                  )}
                </div>

                {/* Identity Info */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                    <School className="text-gray-400" size={18} /> 
                    <span>Studies at <span className="font-bold">University College</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                    <Calendar className="text-gray-400" size={18} /> 
                    <span>Student ID: <span className="font-bold">{profile?.student_number}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                    <Globe className="text-gray-400" size={18} /> 
                    <span>Section: <span className="font-bold">{profile?.section}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Dynamic Tab Content */}
            <div className="lg:col-span-8">
              {activeTab === 'About' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-xl font-black text-fbNavy mb-6">About Me</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-4 bg-fbGray/30 rounded-xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                      <p className="text-sm font-bold text-fbNavy">{profile?.full_name}</p>
                    </div>
                    <div className="p-4 bg-fbGray/30 rounded-xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Role</p>
                      <p className="text-sm font-bold text-fbNavy capitalize">{profile?.role}</p>
                    </div>
                    <div className="p-4 bg-fbGray/30 rounded-xl md:col-span-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Module Progress</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${profile?.pre_test_completed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <p className="text-sm font-bold text-fbNavy">
                          {profile?.pre_test_completed ? 'Initial Pre-Test Completed' : 'Pre-Test Required'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fitness Logs Tab */
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-xl font-black text-fbNavy mb-4">Fitness Assessment Logs</h2>
                  <div className="p-4 bg-fbGray rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-16">
                    <Lock size={40} className="text-gray-300 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Training History Restricted</p>
                    <p className="text-xs text-gray-500 max-w-[250px] mt-2 leading-relaxed">
                      Only the account owner and authorized instructors can view detailed set performance and metabolic stats.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </Layout>
  );
}
