import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import EditProfileModal from '../../components/EditProfileModal'; 
import FitnessLogTab from '../../components/FitnessLogTab'; 
import { supabase } from '../../lib/supabaseClient';
import { PATHFIT_EXERCISES } from '../../constants/exercises';
import { 
  Camera, Edit2, School, Calendar, Award, CheckCircle2, Info, Dumbbell, Globe, 
  Loader2, Clock, Activity, Scale, Ruler, Flame, BookOpen, Trophy, UserCircle 
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
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);
      setBio(profileData?.bio || "Welcome to my PATHFit profile!");

      const { data: logData } = await supabase.from('exercise_logs').select('*')
        .eq('student_id', user.id).order('week_number', { ascending: true });
      setExerciseLogs(logData || []);

      const { data: progressData } = await supabase.from('course_progress').select('*').eq('user_id', user.id).single();
      setCourseProgress(progressData);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- Logic Helpers ---
  const totalCalories = exerciseLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const preTestLogs = exerciseLogs.filter(l => l.log_type === 'assessment' && l.week_number === 0);
  const postTestLogs = exerciseLogs.filter(l => l.log_type === 'assessment' && l.week_number === 9);
  
  const getStreak = () => {
    const uniqueWeeks = [...new Set(exerciseLogs.filter(l => l.log_type === 'workout' && l.week_number !== null).map(l => l.week_number))].sort((a, b) => b - a);
    if (uniqueWeeks.length === 0) return 0;
    let streak = 1;
    for (let i = 0; i < uniqueWeeks.length - 1; i++) {
      if (uniqueWeeks[i] - uniqueWeeks[i + 1] === 1) streak++; else break;
    }
    return streak;
  };

  const calculateBMI = () => {
    if (!profile?.height || !profile?.weight) return null;
    const bmi = (profile.weight / (Math.pow(profile.height / 100, 2))).toFixed(1);
    const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
    return { score: bmi, category };
  };

  const handleSaveBio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({ bio }).eq('id', user.id);
    if (!error) setIsEditingBio(false); else alert("Error: " + error.message);
  };

  const uploadPhoto = async (event, type) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileName = `${profile.id}-${type}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ [type === 'cover' ? 'cover_url' : 'avatar_url']: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      fetchData();
    } catch (error) { alert('Error: ' + error.message); } finally { setUploading(false); }
  };

  // --- Sub-Components ---
  const MilestoneStep = ({ label, isDone, icon }) => (
    <div className="flex flex-col items-center z-10 relative group">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 transition-all shadow-sm ${isDone ? 'bg-fbOrange border-orange-100 text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
        {isDone ? <CheckCircle2 size={16} /> : (icon || <span className="text-[9px] font-black">{label}</span>)}
      </div>
      <span className={`text-[8px] font-black mt-2 uppercase ${isDone ? 'text-fbNavy' : 'text-gray-400'}`}>{label}</span>
    </div>
  );

  if (loading) return null;
  const bmiResult = calculateBMI();

  return (
    <Layout>
      <main className="bg-[#F0F2F5] min-h-screen pb-12">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-[1250px] mx-auto">
            <div className="relative h-[200px] md:h-[350px] bg-fbNavy rounded-b-xl overflow-hidden shadow-inner group">
              {profile?.cover_url ? <img src={profile.cover_url} className="w-full h-full object-cover" alt="Cover" /> : <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />}
              <label className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md">
                {uploading ? <Loader2 className="animate-spin" size={16}/> : <Camera size={18} />} <span>Edit Cover</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e, 'cover')} />
              </label>
            </div>
            <div className="px-4 md:px-12 flex flex-col md:flex-row items-end -mt-12 md:-mt-20 gap-6 mb-4">
              <div className="relative group">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white bg-fbGray overflow-hidden shadow-md flex items-center justify-center text-6xl font-black text-fbNavy relative z-10">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile?.full_name?.charAt(0)}
                </div>
                <label className="absolute bottom-2 right-2 z-20 p-2 bg-gray-200 rounded-full border-2 border-white cursor-pointer"><Camera size={20} /><input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e, 'avatar')} /></label>
              </div>
              <div className="flex-1 pb-4 text-center md:text-left"><h1 className="text-3xl md:text-4xl font-black text-fbNavy">{profile?.full_name}</h1><p className="text-gray-500 font-bold">Student Athlete • {profile?.section_code || profile?.section}</p></div>
              <button onClick={() => setIsEditModalOpen(true)} className="bg-fbOrange text-white px-4 py-2 rounded-lg font-bold text-sm flex gap-2 mb-6 shadow-sm"><Edit2 size={16} /> Edit Profile</button>
            </div>
            <div className="flex gap-2 border-t px-4 md:px-12">
              {['About', 'Logs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-sm font-bold border-b-4 flex items-center gap-2 ${activeTab === tab ? 'border-fbOrange text-fbOrange' : 'border-transparent text-gray-500'}`}>
                  {tab === 'About' ? <Info size={18} /> : <Dumbbell size={18} />} {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1250px] mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {activeTab === 'About' && (
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-fbOrange/10 border border-fbOrange/20 p-4 rounded-xl"><div className="flex items-center gap-2 text-fbOrange mb-1"><Activity size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Current Semester Plan</span></div><p className="text-sm font-bold text-fbNavy">10-Step Fitness Progression</p></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-black text-fbNavy mb-4">Intro</h2>
                {isEditingBio ? (
                  <div className="space-y-2"><textarea className="w-full p-3 bg-gray-50 border rounded-lg text-sm" value={bio} onChange={(e) => setBio(e.target.value)} rows="3" /><div className="flex gap-2"><button onClick={handleSaveBio} className="flex-1 bg-fbOrange text-white py-2 rounded-lg text-xs font-bold">Save</button><button onClick={() => setIsEditingBio(false)} className="flex-1 bg-gray-200 py-2 rounded-lg text-xs font-bold">Cancel</button></div></div>
                ) : ( <div className="text-center"><p className="text-sm font-medium mb-3">"{bio}"</p><button onClick={() => setIsEditingBio(true)} className="w-full bg-gray-100 py-2 rounded-lg text-sm font-bold">Edit Bio</button></div> )}
                <div className="space-y-3 pt-4 border-t mt-4">
                  {[ {icon: School, label: `College of ${profile?.college || "University"}`}, {icon: Calendar, label: `ID: ${profile?.student_id || profile?.student_number}`}, {icon: Globe, label: `Section: ${profile?.section_code || profile?.section}`}, {icon: UserCircle, label: `Sex: ${profile?.sex || "N/A"}`}, {icon: Clock, label: `Age: ${profile?.age || "N/A"} Years`}].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700 text-sm font-medium"><item.icon className="text-gray-400" size={18} /><span>{item.label}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-fbNavy mb-3 flex items-center gap-2"><Scale size={20} className="text-fbOrange" /> Body Composition</h2>
                {bmiResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-fbGray/50 p-3 rounded-lg"><div><p className="text-[10px] font-black text-gray-400">BMI SCORE</p><p className="text-xl font-black text-fbOrange">{bmiResult.score}</p></div><div className="text-right"><p className="text-[10px] font-black text-gray-400">STATUS</p><span className="text-xs font-bold px-2 py-1 bg-fbNavy text-white rounded-full">{bmiResult.category}</span></div></div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 border rounded-lg"><Ruler size={14} className="mx-auto text-gray-400 mb-1" /><p className="text-xs font-bold">{profile?.height} cm</p></div>
                      <div className="p-2 border rounded-lg"><Scale size={14} className="mx-auto text-gray-400 mb-1" /><p className="text-xs font-bold">{profile?.weight} kg</p></div>
                    </div>
                  </div>
                ) : <p className="text-xs text-gray-400 italic text-center">Update profile for BMI.</p>}
              </div>
            </div>
          )}

          <div className={`${activeTab === 'About' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
            {activeTab === 'About' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xs font-black text-fbNavy/40 uppercase tracking-widest mb-8 flex items-center gap-2"><BookOpen size={14} /> PATHFit Semester Roadmap</h3>
                  <div className="relative flex justify-between items-center px-2">
                    <MilestoneStep label="Pre-Test" isDone={exerciseLogs.some(l => l.log_type === 'assessment' && l.week_number === 0)} icon={<Activity size={16} />} />
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => ( <MilestoneStep key={num} label={`W${num}`} isDone={exerciseLogs.some(l => l.log_type === 'workout' && l.week_number === num)} /> ))}
                    <MilestoneStep label="Post-Test" isDone={exerciseLogs.some(l => l.log_type === 'assessment' && l.week_number === 9)} icon={<Trophy size={16} />} />
                    <div className="absolute top-4 md:top-5 left-0 w-full h-[2px] bg-gray-100 -z-0"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-fbNavy to-blue-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                    <Trophy className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform" size={120} />
                    <div className="flex justify-between items-start mb-6"><Trophy className="text-fbAmber" size={28} /><span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">Fitness Level</span></div>
                    <h4 className="text-3xl font-black italic tracking-tight">{bmiResult?.category || "TBD"}</h4><p className="text-white/50 text-xs mt-1 font-bold">Based on Body Composition</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-fbOrange"><Flame size={32} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase">Active Streak</p><h4 className="text-2xl font-black text-fbNavy tracking-tight">{getStreak()} <span className="text-sm text-gray-400">Weeks</span></h4></div>
                  </div>
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-fbNavy/40 uppercase mb-6 flex items-center gap-2"><Activity size={16} className="text-fbOrange" /> Performance Benchmark</h3>
                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white"><tr className="text-[10px] text-gray-400 uppercase border-b"><th className="pb-4">Fitness Test</th><th className="pb-4">Pre-Test</th><th className="pb-4 text-fbOrange">Best</th><th className="pb-4 text-right">Progress</th></tr></thead>
                        <tbody className="text-sm font-bold text-fbNavy">
                          {PATHFIT_EXERCISES.map(ex => {
                            const preVal = preTestLogs.find(l => l.exercise_id === ex.id)?.set_1_val || 0;
                            const currVal = Math.max(...exerciseLogs.filter(l => l.exercise_id === ex.id).map(l => l.set_1_val || 0), 0);
                            const diff = currVal - preVal;
                            return (
                              <tr key={ex.id} className="border-b hover:bg-gray-50 transition-colors"><td className="py-4 text-gray-500">{ex.name}</td><td className="py-4">{preVal || "--"}</td><td className="py-4 text-fbOrange">{currVal || "--"}</td><td className="py-4 text-right">{diff > 0 ? <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full">+{diff}</span> : "--"}</td></tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-fbOrange p-[1px] rounded-2xl shadow-xl shadow-fbOrange/10">
                    <div className="bg-white p-6 rounded-[15px] flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-5"><div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><Dumbbell size={28} /></div><div><h4 className="text-fbNavy font-black text-xl italic uppercase">Aggregate Energy Output</h4><p className="text-gray-400 text-[10px] font-black uppercase">Total calories burned</p></div></div>
                      <div className="flex items-baseline gap-2"><span className="text-5xl font-black text-fbOrange tracking-tighter">{totalCalories.toLocaleString()}</span><span className="font-black text-fbNavy italic text-sm">KCAL</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : <FitnessLogTab logs={exerciseLogs} />}
          </div>
        </div>
      </main>
      <EditProfileModal profile={profile} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onRefresh={fetchData} />
    </Layout>
  );
}
