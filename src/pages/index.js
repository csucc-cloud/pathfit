import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    };
    getUser();
  }, [router]);

  if (!user) return <div className="p-10 text-center">Redirecting to Login...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to PATHFit Pro</h1>
      <p className="text-gray-600">You are logged in as: {user.email}</p>
    </div>
  );
}
