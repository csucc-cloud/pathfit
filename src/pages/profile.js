// src/pages/profile.js
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { User, Mail, Calendar, Hash, ShieldCheck, Loader2 } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-fbOrange" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="p-4 md:p-10 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-fbNavy flex items-center gap-3">
            <User className="text-fbOrange w-8 h-8" />
            Student Profile
          </h1>
          <p className="text-gray-500 font-medium">Manage your personal information and account settings.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-fbNavy mb-6 border-b pb-4">Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <p className="text-fbNavy font-bold mt-1">{profile?.full_name || 'Not Set'}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Student ID</label>
                  <p className="text-fbNavy font-bold mt-1">{profile?.student_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Section</label>
                  <p className="text-fbNavy font-bold mt-1">{profile?.section || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Role</label>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-4 h-4 text-fbAmber" />
                    <p className="text-fbNavy font-bold capitalize">{profile?.role || 'Student'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Sidebar */}
          <div className="space-y-6">
            <div className="bg-fbNavy text-white p-8 rounded-3xl shadow-xl shadow-fbNavy/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
              <h3 className="text-sm font-black uppercase tracking-widest text-fbAmber mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Pre-Test:</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${profile?.pre_test_completed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {profile?.pre_test_completed ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Member Since:</span>
                  <span className="text-white font-bold text-xs">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
