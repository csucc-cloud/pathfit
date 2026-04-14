import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    const { error } = isSigningUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (isSigningUp) {
        alert("Registration successful! You can now sign in.");
        setIsSigningUp(false);
      } else {
        router.push('/profile');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f7f9]">
      <div className="fb-card w-full max-w-md p-8 bg-white shadow-lg border-t-4 border-[#039be5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#051e34]">PATHFit Pro</h1>
          <p className="text-[#039be5] font-medium uppercase tracking-widest text-sm">Student Portal</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="fitness-input w-full p-3 border rounded"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="fitness-input w-full p-3 border rounded"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary w-full py-3 text-lg font-bold bg-[#039be5] text-white rounded">
            {isSigningUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => setIsSigningUp(!isSigningUp)}
          className="w-full mt-6 text-sm text-[#039be5] font-semibold hover:underline"
        >
          {isSigningUp ? 'Already have an account? Sign in' : 'First time? Register here'}
        </button>
      </div>
    </div>
  );
}
