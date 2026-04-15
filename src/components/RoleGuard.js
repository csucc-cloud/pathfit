import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function RoleGuard({ children, allowedRole }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/'); // Not logged in? Go to login
        return;
      }

      if (allowedRole === 'instructor') {
        const { data } = await supabase
          .from('instructors')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (!data) {
          alert("Unauthorized: Instructors Only");
          router.push('/practicum/1');
        } else {
          setLoading(false);
        }
      } 
      
      else if (allowedRole === 'student') {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (!data) {
          // If they are an instructor trying to see student pages
          router.push('/admin');
        } else {
          setLoading(false);
        }
      }
    };

    checkAccess();
  }, [allowedRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fbGray">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fbOrange"></div>
      </div>
    );
  }

  return children;
}
