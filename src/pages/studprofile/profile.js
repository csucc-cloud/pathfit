import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import EditProfileModal from '../../components/EditProfileModal'; // New component import
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
  Globe,
  Loader2,
  Clock
} from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state
  const [bio, setBio] = useState("");

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      setBio(profileData?.bio || "Welcome to my PATHFit profile!");

      // 2. Fetch Exercise Logs
      const { data: logData } = await supabase
        .from('exercise_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setExerciseLogs(logData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadPhoto = async (event, type) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${type}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updateField = type === 'cover' ? 'cover_url' : 'avatar_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      await fetchData(); 
      alert(`${type === 'cover' ? 'Cover' : 'Profile'} photo updated!`);
    } catch (error) {
      alert('Error uploading: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bio })
      .eq('id', user.id);

    if (!error) setIsEditingBio(false);
    else alert("Error updating bio: " + error.message);
  };

  if (loading) return null;

  return (
    <Layout>
      <main className="bg-[#F0F2F5] min-h-screen pb-12">
        {/* FACEBOOK STYLE HEADER */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-[1250px] mx-auto">
            
            {/* Cover Photo */}
            <div className="relative h-[200px] md:h-[350px] w-full bg-fbNavy rounded-b-xl overflow-hidden shadow-inner group">
               {profile?.cover_url ? (
                 <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" />
               ) : (
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               )}
               <label className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-black px-3 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all">
                 {uploading ? <Loader2 className="animate-spin" size={16}/> : <Camera size={18} />} 
                 <span>Edit Cover Photo</span>
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e, 'cover')} disabled={uploading} />
               </label>
            </div>

            {/* Profile Info Area */}
            <div className="px-4 md:px-12">
              <div className="flex flex-col md:flex-row items-end -mt-12 md:-mt-20 gap-6 mb-4">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white bg-fbGray overflow-hidden shadow-md flex items-center justify-center text-6xl font-black text-fbNavy relative z-10">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      profile?.full_name?.charAt(0)
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 z-20 p-2 bg-gray-200 hover:bg-gray-300 rounded-full border-2 border-white cursor-pointer shadow-sm transition-all">
                    <Camera size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e, 'avatar')} disabled={uploading} />
                  </label>
                </div>

                <div className="flex-1 pb-4 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-black text-fbNavy">{profile?.full_name}</h1>
                  <p className="text-gray-500 font-bold">Student Athlete • {profile?.section}</p>
                </div>

                <div className="flex gap-2 mb-6">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-fbOrange text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:brightness-110 transition-all"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex items-center gap-2 border-t border-gray-100">
                <button onClick={() => setActiveTab('About')} className={`px-6 py-4 text-sm font-bold transition-all border-b-4 flex items-center gap-2 ${activeTab === 'About' ? 'border-fbOrange text-fbOrange' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                  <Info size={18} /> About
                </button>
                <button onClick={() => setActiveTab('Logs')} className={`px-6 py-4 text-sm font-bold transition-all border-b-4 flex items-center gap-2 ${activeTab === 'Logs' ? 'border-fbOrange text-fbOrange' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                  <Dumbbell size={18} /> Fitness Logs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-[1250px] mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-black text-fbNavy mb-4">Intro</h2>
                <div className="mb-6">
                  {isEditingBio ? (
                    <div className="space-y-2">
                      <textarea className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-fbOrange outline-none" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveBio} className="flex-1 bg-fbOrange text-white py-2 rounded-lg text-xs font-bold">Save</button>
                        <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-gray-200 py-2 rounded-lg text-xs font-bold">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3 px-2">"{bio}"</p>
                      <button onClick={() => setIsEditingBio(true)} className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold transition-colors">Edit Bio</button>
                    </div>
                  )}
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-medium"><School className="text-gray-400" size={18} /><span>Studying at <span className="font-bold">{profile?.college}</span></span></div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-medium"><Calendar className="text-gray-400" size={18} /><span>Student ID: <span className="font-bold">{profile?.student_id}</span></span></div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm font-medium"><Globe className="text-gray-400" size={18} /><span>Section: <span className="font-bold">{profile?.section_code}</span></span></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8">
              {activeTab === 'About' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-black text-fbNavy mb-6">About Me</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-4 bg-fbGray/30 rounded-xl"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p><p className="text-sm font-bold text-fbNavy">{profile?.full_name}</p></div>
                    <div className="p-4 bg-fbGray/30 rounded-xl"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Role</p><p className="text-sm font-bold text-fbNavy capitalize">{profile?.role}</p></div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-black text-fbNavy mb-6">Exercise History</h2>
                  {exerciseLogs.length > 0 ? (
                    <div className="space-y-3">
                      {exerciseLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-fbOrange transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-fbOrange shadow-sm"><Dumbbell size={20} /></div>
                            <div>
                              <p className="font-black text-fbNavy text-sm capitalize">{log.exercise_type || log.activity_name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold"><Clock size={12} />{new Date(log.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-fbOrange">{log.duration || log.reps || log.result || '--'}</p>
                            <p className="text-[10px] uppercase font-black text-gray-400">Score/Result</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-fbGray rounded-2xl border-2 border-dashed border-gray-200">
                      <Lock size={40} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Logs Available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* RENDER MODAL */}
      <EditProfileModal 
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onRefresh={fetchData}
      />
    </Layout>
  );
}
