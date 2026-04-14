import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Layout from '../components/ui/Layout'; // New Layout Wrapper

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: '',
    section_id: '',
    sex: '',
    age: ''
  });

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      let { data, error } = await supabase
        .from('profiles')
        .select(`full_name, section_id, sex, age`)
        .eq('id', user.id)
        .single();

      if (data) setProfile(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const updates = {
      id: user.id,
      ...profile,
      updated_at: new Date(),
    };

    let { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      alert(error.message);
    } else {
      router.push('/phase/1-pre-test'); // Move to Phase 1 after setup
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#039be5] rounded-full"></div>
          <p className="font-black text-[#051e34] tracking-widest text-xs uppercase">Initializing Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Student Identity">
      <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="fb-card border-t-8 border-[#039be5] shadow-2xl">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#051e34] mb-1 italic uppercase tracking-tighter">Profile Setup</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Complete this to unlock your training logs.</p>
            </div>

            <form onSubmit={updateProfile} className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 group-focus-within:text-[#039be5] transition-colors tracking-widest">Full Name</label>
                <input
                  type="text"
                  className="fitness-input"
                  placeholder="Juan Dela Cruz"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 group-focus-within:text-[#039be5] transition-colors tracking-widest">Section / Class</label>
                <input
                  type="text"
                  className="fitness-input"
                  placeholder="e.g. BSIT-1A"
                  value={profile.section_id || ''}
                  onChange={(e) => setProfile({ ...profile, section_id: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest text-center">Age</label>
                  <input
                    type="number"
                    className="fitness-input"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest text-center">Sex</label>
                  <select
                    className="fitness-input appearance-none bg-no-repeat bg-right-4"
                    value={profile.sex || ''}
                    onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 group" 
                disabled={loading}
              >
                <span>{loading ? 'Processing...' : 'Start Training'}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
          PATHFit Pro System v1.0
        </p>
      </div>
    </Layout>
  );
}
