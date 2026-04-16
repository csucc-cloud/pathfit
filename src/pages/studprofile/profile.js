import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import EditProfileModal from '../../components/EditProfileModal'; 
import FitnessLogTab from '../../components/FitnessLogTab'; 
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
  Clock,
  Activity,
  Scale,
  Ruler,
  Flame,
  BookOpen,
  Trophy,
  ChevronRight
} from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
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
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setExerciseLogs(logData || []);

      // 3. Fetch Course Progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setCourseProgress(progressData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CALCULATIONS FOR NEW FEATURES ---
  
  // Feature #18: Total Calories
  const totalCalories = exerciseLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);

  // Feature #1: Assessment Comparison
  const assessments = exerciseLogs
    .filter(log => log.log_type === 'assessment')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  const preTest = assessments[0] || null;
  const currentTest = assessments.length > 1 ? assessments[assessments.length - 1] : null;

  // Feature #5: Streak Logic (Unique weeks)
  const getStreak = () => {
    const uniqueWeeks = new Set(exerciseLogs.map(log => {
      const d = new Date(log.created_at);
      return `${d.getFullYear()}-${Math.ceil(d.getDate() / 7)}`;
    }));
    return uniqueWeeks.size;
  };

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

  const calculateBMI = () => {
    if (!profile?.height || !profile?.weight) return null;
    const heightInMeters = profile.height / 100;
    const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    return { score: bmi, category };
  };

  const bmiResult = calculateBMI();

  if (loading) return null;

  return (
    <Layout>
      <main className="bg-[#F0F2F5] min-h-screen pb-12">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-[1250px] mx-auto">
            
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
                  <p className="text-gray-500 font-bold">Student Athlete • {profile?.section_code || profile?.section}</p>
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

        <div className="max-w-[1250px] mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {activeTab === 'About' && (
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-fbOrange/10 border border-fbOrange/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-fbOrange mb-1">
                    <Activity size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Current Module</span>
                  </div>
                  <p className="text-sm font-bold text-fbNavy">Physical Fitness Assessment</p>
                  <p className="text-[11px] text-gray-500 mt-1">Status: Active Assessment Period</p>
                </div>

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
                    <div className="flex items-center gap-3 text-gray-700 text-sm font-medium"><School className="text-gray-400" size={18} /><span>College of <span className="font-bold">{profile?.college || "University"}</span></span></div>
                    <div className="flex items-center gap-3 text-gray-700 text-sm font-medium"><Calendar className="text-gray-400" size={18} /><span>Student ID: <span className="font-bold">{profile?.student_id || profile?.student_number}</span></span></div>
                    <div className="flex items-center gap-3 text-gray-700 text-sm font-medium"><Globe className="text-gray-400" size={18} /><span>Section: <span className="font-bold">{profile?.section_code || profile?.section}</span></span></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-black text-fbNavy mb-3 flex items-center gap-2">
                    <Scale size={20} className="text-fbOrange" /> Body Composition
                  </h2>
                  {bmiResult ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-fbGray/50 p-3 rounded-lg">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">BMI Score</p>
                          <p className="text-xl font-black text-fbOrange">{bmiResult.score}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
                          <span className="text-xs font-bold px-2 py-1 bg-fbNavy text-white rounded-full">{bmiResult.category}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 border border-gray-100 rounded-lg">
                          <Ruler size={14} className="mx-auto text-gray-400 mb-1" />
                          <p className="text-xs font-bold">{profile?.height} cm</p>
                        </div>
                        <div className="p-2 border border-gray-100 rounded-lg">
                          <Scale size={14} className="mx-auto text-gray-400 mb-1" />
                          <p className="text-xs font-bold">{profile?.weight} kg</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-2">Update Height/Weight to see BMI.</p>
                  )}
                </div>
              </div>
            )}

            <div className={`${activeTab === 'About' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
              {activeTab === 'About' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  
                  {/* FEATURE #3: MODULE PROGRESS TRACKER */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xs font-black text-fbNavy/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <BookOpen size={14} /> Course Journey Progress
                    </h3>
                    <div className="relative flex justify-between items-center">
                      {[
                        { label: 'Pre-Test', key: 'pre_test_completed' },
                        { label: 'Module 1', key: 'module_1_read' },
                        { label: 'Midterm', key: 'midterm_passed' },
                        { label: 'Post-Test', key: 'post_test_completed' }
                      ].map((step, idx) => {
                        const isDone = courseProgress?.[step.key];
                        return (
                          <div key={idx} className="flex flex-col items-center z-10 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                              isDone ? 'bg-fbOrange border-fbOrange/20 text-white' : 'bg-gray-100 border-transparent text-gray-400'
                            }`}>
                              {isDone ? <CheckCircle2 size={20} /> : idx + 1}
                            </div>
                            <span className="text-[10px] font-black mt-2 text-fbNavy uppercase tracking-tighter">{step.label}</span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FEATURE #4 & #5: CLASSIFICATION & STREAK */}
                    <div className="bg-gradient-to-br from-fbNavy to-blue-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Trophy size={120} />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <Trophy className="text-fbAmber" size={28} />
                        <span className="bg-white/10 backdrop-blur-md text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/10">Fitness Level</span>
                      </div>
                      <h4 className="text-3xl font-black italic tracking-tight">{bmiResult?.category || "TBD"}</h4>
                      <p className="text-white/50 text-xs mt-1 font-bold">Calculated from Body Composition</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 shadow-sm">
                      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-fbOrange">
                        <Flame size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Streak</p>
                        <h4 className="text-2xl font-black text-fbNavy tracking-tight">{getStreak()} <span className="text-sm text-gray-400 uppercase">Weeks</span></h4>
                      </div>
                    </div>

                    {/* FEATURE #1: COMPARISON TABLE */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-black text-fbNavy/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-fbOrange" /> Performance Benchmark
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-50">
                              <th className="pb-4">Fitness Test</th>
                              <th className="pb-4">Pre-Test</th>
                              <th className="pb-4">Current Best</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-bold text-fbNavy">
                            <tr className="border-b border-gray-50 group hover:bg-gray-50 transition-colors">
                              <td className="py-4 text-gray-500 group-hover:text-fbNavy">Push-ups</td>
                              <td className="py-4">{preTest?.metrics?.push_ups || "--"}</td>
                              <td className="py-4 text-fbOrange">{currentTest?.metrics?.push_ups || "--"}</td>
                            </tr>
                            <tr className="border-b border-gray-50 group hover:bg-gray-50 transition-colors">
                              <td className="py-4 text-gray-500 group-hover:text-fbNavy">Plank (sec)</td>
                              <td className="py-4">{preTest?.metrics?.plank_seconds ? `${preTest.metrics.plank_seconds}s` : "--"}</td>
                              <td className="py-4 text-fbOrange">{currentTest?.metrics?.plank_seconds ? `${currentTest.metrics.plank_seconds}s` : "--"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* FEATURE #18: TOTAL CALORIES */}
                    <div className="md:col-span-2 bg-fbOrange p-[1px] rounded-2xl shadow-xl shadow-fbOrange/10">
                      <div className="bg-white p-6 rounded-[15px] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                            <Dumbbell size={28} />
                          </div>
                          <div className="text-center md:text-left">
                            <h4 className="text-fbNavy font-black text-xl italic tracking-tight uppercase">Aggregate Energy Output</h4>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total calories burned across all logs</p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-fbOrange tracking-tighter">{totalCalories.toLocaleString()}</span>
                          <span className="font-black text-fbNavy italic text-sm">KCAL</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ORIGINAL ABOUT ME SECTION */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-black text-fbNavy mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-fbGray/30 rounded-xl border border-white"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p><p className="text-sm font-bold text-fbNavy">{profile?.full_name}</p></div>
                      <div className="p-4 bg-fbGray/30 rounded-xl border border-white"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Role</p><p className="text-sm font-bold text-fbNavy capitalize">{profile?.role}</p></div>
                      <div className="p-4 bg-fbGray/30 rounded-xl border border-white"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sex</p><p className="text-sm font-bold text-fbNavy">{profile?.sex || "N/A"}</p></div>
                      <div className="p-4 bg-fbGray/30 rounded-xl border border-white"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p><p className="text-sm font-bold text-fbNavy">{profile?.age ? `${profile.age} Years Old` : "N/A"}</p></div>
                    </div>
                  </div>
                </div>
              ) : (
                <FitnessLogTab logs={exerciseLogs} />
              )}
            </div>
          </div>
        </div>
      </main>

      <EditProfileModal 
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onRefresh={fetchData}
      />
    </Layout>
  );
}
