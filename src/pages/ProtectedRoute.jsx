import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function ProtectedRoute({ children, roleRequired }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        // Fetch the user's role from our 'profiles' table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleRequired && profile?.role !== roleRequired) {
          router.push('/'); // Send home if role doesn't match
        } else {
          setUser(session.user);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [router, roleRequired]);

  if (loading) return <div className="p-8 text-center">Loading Console...</div>;

  return user ? children : null;
}
