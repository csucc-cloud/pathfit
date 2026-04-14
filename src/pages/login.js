import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSigningUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#051e34', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      fontFamily: 'sans-serif' 
    }}>
      {/* Container Card */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1100px', 
        minHeight: '600px', 
        backgroundColor: 'white', 
        borderRadius: '2.5rem', 
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* LEFT: FORM SIDE */}
        <div style={{ flex: '1', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#039be5', color: 'white', borderRadius: '12px', fontWeight: '900', fontSize: '1.5rem', marginBottom: '1rem' }}>P</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#051e34', margin: '0', letterSpacing: '-1px' }}>PATHFit Pro</h2>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '2px', marginTop: '0.5rem' }}>STUDENT PORTAL</p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input 
                type="email" 
                placeholder="name@university.edu"
                style={{ width: '100%', padding: '1rem', backgroundColor: '#f9fafb', border: '2px solid #f3f4f6', borderRadius: '1rem', fontWeight: 'bold', outline: 'none' }}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                style={{ width: '100%', padding: '1rem', backgroundColor: '#f9fafb', border: '2px solid #f3f4f6', borderRadius: '1rem', fontWeight: 'bold', outline: 'none' }}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              style={{ width: '100%', padding: '1.25rem', backgroundColor: '#039be5', color: 'white', border: 'none', borderRadius: '1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(3, 155, 229, 0.3)' }}
            >
              {loading ? 'Authenticating...' : (isSigningUp ? 'Join Now' : 'Sign In')}
            </button>
          </form>

          <button 
            onClick={() => setIsSigningUp(!isSigningUp)}
            style={{ background: 'none', border: 'none', color: '#039be5', fontWeight: 'bold', marginTop: '2rem', cursor: 'pointer', fontSize: '12px' }}
          >
            {isSigningUp ? 'Already have an account? Log In' : 'Need an account? Create one'}
          </button>
        </div>

        {/* RIGHT: WAVE HERO SIDE */}
        <div style={{ 
          flex: '1.2', 
          backgroundColor: '#051e34', 
          padding: '4rem', 
          display: 'flex', 
          alignItems: 'flex-end', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Visual Gradient (The "Wave" feel) */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 0% 0%, #039be5 0%, transparent 70%), radial-gradient(circle at 100% 100%, #f4ebd1 20%, transparent 70%)',
            opacity: 0.4
          }}></div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '5rem', color: 'white', fontWeight: '900', fontStyle: 'italic', margin: 0, lineHeight: 0.9 }}>Welcome.</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1.5rem', maxWidth: '300px', lineHeight: '1.6', fontSize: '14px' }}>
              Access your training logs, performance metrics, and pre-test requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


