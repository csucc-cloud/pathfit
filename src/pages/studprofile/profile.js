import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import EditProfileModal from '../../components/EditProfileModal'; 
import FitnessLogTab from '../../components/FitnessLogTab'; 
import { supabase } from '../../lib/supabaseClient';
import { PATHFIT_EXERCISES } from '../../constants/exercises';
import { 
  Camera, Edit2, School, Calendar, Award, CheckCircle2, Info, Dumbbell, Globe, 
  Loader2, Clock, Activity, Scale, Ruler, Flame, BookOpen, Trophy, UserCircle,
  TrendingUp, Sparkles, Target, Zap
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

  const MilestoneStep = ({ label, isDone, icon }) => (
    <div className="flex flex-col items-center z-10 relative group">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${isDone ? 'bg-fbOrange border-white text-white rotate-3 scale-110' : 'bg-white/80 backdrop-blur-sm border-gray-100 text-gray-300'}`}>
        {isDone ? <CheckCircle2 size={20} className="animate-pulse" /> : (icon || <span className="text-[10px] font-black">{label}</span>)}
      </div>
      <div className={`absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-fbNavy text-white text-[8px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap`}>
        {label}
      </div>
    </div>
  );

  if (loading) return null;
  const bmiResult = calculateBMI();

  return (
    <Layout>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F8F9FD; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF6B00; }
      `}} />

      <main className="bg-[#F8F9FD] min-h-screen pb-20">
        {/* --- HEADER SECTION --- */}
        <div className="bg-white shadow-xl shadow-blue-900/5 relative z-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="relative h-[250px] md:h-[400px] bg-fbNavy rounded-b-[40px] overflow-hidden group">
              {profile?.cover_url ? (
                <img src={profile.cover_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Cover" />
              ) : (
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-fbNavy/80 via-transparent to-transparent" />
              <label className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all border border-white/30 uppercase tracking-widest">
                {uploading ? <Loader2 className="animate-spin" size={16}/> : <Camera size={18} />} <span>Change Cover</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e, 'cover')} />
              </label>
            </div>

            <div className="px-6 md:px-16 flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-24 gap-8 mb-8">
              <div className="relative group">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-[40px] border-[6px] border-white bg-white overflow-hidden shadow-2xl transition-transform duration-500 hover:rotate-2 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-fbGray flex items-center justify-center text-7xl font-black text-fbNavy uppercase">
                      {profile?.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-4 right-4 z-20 p-3 bg-fbOrange text-white rounded-2xl border-4 border-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e, 'avatar')} />
                </label>
              </div>

              <div className="flex-1 pb-4 text-center md:text-left space-y-1">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-black text-fbNavy tracking-tight drop-shadow-sm">
                    {profile?.full_name}
                  </h1>
                  <span className="bg-fbOrange/10 text-fbOrange px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-fbOrange/20">
                    Verified Athlete
                  </span>
                </div>
                <p className="text-gray-400 font-bold flex items-center justify-center md:justify-start gap-2">
                  <School size={16} className="text-fbOrange" /> 
                  College of {profile?.college || "University"} • {profile?.section_code || profile?.section}
                </p>
              </div>

              <button onClick={() => setIsEditModalOpen(true)} className="bg-fbNavy text-white px-8 py-4 rounded-2xl font-black text-sm flex gap-3 mb-6 shadow-xl shadow-fbNavy/20 hover:bg-fbOrange hover:shadow-fbOrange/20 transition-all hover:-translate-y-1">
                <Edit2 size={18} /> UPDATE PROFILE
              </button>
            </div>

            <div className="flex gap-8 border-t border-gray-50 px-6 md:px-16">
              {['About', 'Logs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2 py-6 text-xs font-black uppercase tracking-[0.2em] border-b-[4px] flex items-center gap-3 transition-all ${activeTab === tab ? 'border-fbOrange text-fbOrange' : 'border-transparent text-gray-300 hover:text-fbNavy'}`}>
                  {tab === 'About' ? <UserCircle size={20} /> : <Zap size={20} />} {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="max-w-[1400px] mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {activeTab === 'About' && (
            <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="bg-gradient-to-r from-fbNavy to-blue-900 p-6 rounded-[30px] shadow-lg relative overflow-hidden group">
                <Sparkles className="absolute -right-2 -top-2 text-white/10 group-hover:rotate-12 transition-transform" size={80} />
                <div className="flex items-center gap-3 text-fbOrange mb-3">
                  <Target size={20} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Current Mission</span>
                </div>
                <p className="text-lg font-black text-white italic">10-Step Fitness Progression</p>
              </div>

              <div className="bg-white p-8 rounded-[35px] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-fbNavy tracking-tight italic">BIO</h2>
                   <BookOpen size={20} className="text-fbGray" />
                </div>
                {isEditingBio ? (
                  <div className="space-y-4">
                    <textarea className="w-full p-4 bg-fbGray/30 border-none rounded-2xl text-sm focus:ring-2 focus:ring-fbOrange transition-all font-medium" value={bio} onChange={(e) => setBio(e.target.value)} rows="4" />
                    <div className="flex gap-3">
                      <button onClick={handleSaveBio} className="flex-1 bg-fbOrange text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest">Confirm</button>
                      <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-gray-100 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
                    </div>
                  </div>
                ) : ( 
                  <div className="text-center group">
                    <p className="text-sm font-medium leading-relaxed text-gray-600 mb-6 italic underline decoration-fbOrange/20 decoration-4 underline-offset-4">"{bio}"</p>
                    <button onClick={() => setIsEditingBio(true)} className="w-full bg-fbGray/50 hover:bg-fbNavy hover:text-white py-4 rounded-2xl text-xs font-black transition-all uppercase tracking-widest border border-transparent">Edit Bio</button>
                  </div> 
                )}
                
                <div className="space-y-5 pt-8 border-t border-gray-50 mt-8">
                  {[ 
                    {icon: Calendar, label: "Student ID", val: profile?.student_id || profile?.student_number}, 
                    {icon: Globe, label: "Class Section", val: profile?.section_code || profile?.section}, 
                    {icon: UserCircle, label: "Gender", val: profile?.sex || "N/A"}, 
                    {icon: Clock, label: "Current Age", val: `${profile?.age || "N/A"} Years`}
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-fbGray/50 rounded-lg text-fbNavy group-hover:bg-fbOrange/10 group-hover:text-fbOrange transition-colors">
                          <item.icon size={18} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-fbNavy uppercase tracking-tight">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[35px] shadow-xl shadow-gray-200/50 border border-gray-100 group">
                <h2 className="text-lg font-black text-fbNavy mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Scale size={20} /></div> 
                  Physical Metrics
                </h2>
                {bmiResult ? (
                  <div className="space-y-6">
                    <div className="relative p-6 rounded-[25px] bg-gradient-to-br from-fbGray/50 to-white border border-gray-100 shadow-inner">
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-1 uppercase">Body Mass Index</p>
                          <p className="text-4xl font-black text-fbNavy tracking-tighter">{bmiResult.score}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Analysis</p>
                          <span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest ${bmiResult.category === 'Normal' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-fbOrange/10 text-fbOrange border-fbOrange/20'}`}>
                            {bmiResult.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-fbGray/30 rounded-2xl border border-transparent hover:border-fbNavy/10 transition-all">
                        <Ruler size={16} className="mx-auto text-fbNavy mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Height</p>
                        <p className="text-sm font-black text-fbNavy">{profile?.height} <span className="text-[10px]">CM</span></p>
                      </div>
                      <div className="p-4 bg-fbGray/30 rounded-2xl border border-transparent hover:border-fbNavy/10 transition-all">
                        <Scale size={16} className="mx-auto text-fbNavy mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Weight</p>
                        <p className="text-sm font-black text-fbNavy">{profile?.weight} <span className="text-[10px]">KG</span></p>
                      </div>
                    </div>
                  </div>
                ) : <p className="text-xs text-gray-400 italic text-center py-4 bg-fbGray/50 rounded-2xl">Complete measurements in settings.</p>}
              </div>
            </div>
          )}

          <div className={`${activeTab === 'About' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-10`}>
            {activeTab === 'About' ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-10">
                {/* --- ROADMAP SECTION --- */}
                <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-fbOrange/5 rounded-bl-full -z-0" />
                  <h3 className="text-[10px] font-black text-fbNavy uppercase tracking-[0.3em] mb-12 flex items-center gap-3 relative z-10 opacity-40">
                    <TrendingUp size={16} /> Learning Path Progression
                  </h3>
                  <div className="relative flex justify-between items-center px-4">
                    <MilestoneStep label="Intro" isDone={exerciseLogs.some(l => l.log_type === 'assessment' && l.week_number === 0)} icon={<Activity size={20} />} />
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => ( 
                      <MilestoneStep key={num} label={`W${num}`} isDone={exerciseLogs.some(l => l.log_type === 'workout' && l.week_number === num)} /> 
                    ))}
                    <MilestoneStep label="Final" isDone={exerciseLogs.some(l => l.log_type === 'assessment' && l.week_number === 9)} icon={<Trophy size={20} />} />
                    <div className="absolute top-[22px] md:top-[26px] left-0 w-full h-[3px] bg-gray-100 rounded-full -z-0">
                       <div className="h-full bg-fbOrange rounded-full transition-all duration-1000" style={{ width: `${(exerciseLogs.filter(l => l.week_number <= 9).length / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-fbNavy p-8 rounded-[35px] text-white shadow-2xl shadow-fbNavy/30 relative overflow-hidden group">
                    <Trophy className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-700" size={180} />
                    <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm"><Award className="text-fbAmber" size={32} /></div>
                      <span className="bg-fbOrange px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-fbOrange/20">Elite Rank</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Body Composition Analysis</p>
                    <h4 className="text-5xl font-black italic tracking-tighter uppercase drop-shadow-md">
                      {bmiResult?.category || "TBD"}
                    </h4>
                  </div>

                  <div className="bg-white p-8 rounded-[35px] border border-gray-100 flex items-center gap-6 shadow-xl shadow-gray-200/30 group hover:-translate-y-1 transition-all">
                    <div className="w-20 h-20 bg-orange-50 rounded-[25px] flex items-center justify-center text-fbOrange group-hover:scale-110 transition-transform duration-500">
                       <Flame size={40} className="drop-shadow-sm" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Activity Streak</p>
                      <h4 className="text-4xl font-black text-fbNavy tracking-tighter uppercase leading-none">
                        {getStreak()} <span className="text-sm font-bold text-gray-300">WKS</span>
                      </h4>
                    </div>
                  </div>

                  {/* --- SCROLLABLE PERFORMANCE TABLE --- */}
                  <div className="md:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/30">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black text-fbNavy uppercase tracking-[0.3em] flex items-center gap-3">
                        <Activity size={18} className="text-fbOrange" /> Training Benchmarks
                      </h3>
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">Scroll to view all</span>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[450px] pr-4 custom-scrollbar">
                      <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="sticky top-0 bg-white z-20">
                          <tr className="text-[10px] text-gray-300 uppercase tracking-widest">
                            <th className="pb-6 font-black italic border-b border-gray-50">Assessment Type</th>
                            <th className="pb-6 font-black text-center border-b border-gray-50">Baseline</th>
                            <th className="pb-6 font-black text-center text-fbOrange border-b border-gray-50">Peak Performance</th>
                            <th className="pb-6 text-right font-black border-b border-gray-50">Delta</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-black text-fbNavy">
                          {PATHFIT_EXERCISES.map(ex => {
                            const preVal = preTestLogs.find(l => l.exercise_id === ex.id)?.set_1_val || 0;
                            const currVal = Math.max(...exerciseLogs.filter(l => l.exercise_id === ex.id).map(l => l.set_1_val || 0), 0);
                            const diff = currVal - preVal;
                            return (
                              <tr key={ex.id} className="group border-b border-gray-50/50 hover:bg-fbGray/30 transition-all">
                                <td className="py-5 text-gray-500 font-bold group-hover:text-fbNavy transition-colors">{ex.name}</td>
                                <td className="py-5 text-center font-black">{preVal || "--"}</td>
                                <td className="py-5 text-center font-black text-fbOrange scale-110">{currVal || "--"}</td>
                                <td className="py-5 text-right">
                                  {diff > 0 ? (
                                    <span className="text-[9px] font-black bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg shadow-green-500/20 tracking-tighter">
                                      +{diff}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-lg">0</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* --- CALORIE TOTAL CARD --- */}
                  <div className="md:col-span-2 bg-gradient-to-r from-fbOrange to-orange-400 p-[2px] rounded-[35px] shadow-2xl shadow-fbOrange/20 transform hover:scale-[1.01] transition-transform duration-500">
                    <div className="bg-white p-8 rounded-[33px] flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-24 bg-fbOrange/5 skew-x-12" />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 bg-fbNavy text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
                          <Dumbbell size={36} />
                        </div>
                        <div>
                          <h4 className="text-fbNavy font-black text-2xl tracking-tighter uppercase italic leading-none mb-2">Total Energy Expenditure</h4>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                             <Zap size={14} className="text-fbOrange" /> Cumulative Burn Score
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center md:items-end relative z-10">
                        <div className="flex items-baseline gap-3">
                          <span className="text-7xl font-black text-fbNavy tracking-tighter drop-shadow-sm">
                            {totalCalories.toLocaleString()}
                          </span>
                          <span className="font-black text-fbOrange italic text-lg tracking-widest animate-pulse">KCAL</span>
                        </div>
                        <div className="mt-2 bg-fbNavy text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em]">
                          Global Achievement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                <FitnessLogTab logs={exerciseLogs} />
              </div>
            )}
          </div>
        </div>
      </main>
      <EditProfileModal profile={profile} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onRefresh={fetchData} />
    </Layout>
  );
}
