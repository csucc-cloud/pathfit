import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

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

  if (loading) return <div className="p-8 text-center">Loading PATHFit Profile...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fb-card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-[#051e34] mb-2">Student Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Complete this to unlock your training logs.</p>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              className="fitness-input"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Section (e.g., BSIT-1A)</label>
            <input
              type="text"
              className="fitness-input"
              value={profile.section_id || ''}
              onChange={(e) => setProfile({ ...profile, section_id: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Age</label>
              <input
                type="number"
                className="fitness-input"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Sex</label>
              <select
                className="fitness-input"
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

          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Start Training'}
          </button>
        </form>
      </div>
    </div>
  );
}
