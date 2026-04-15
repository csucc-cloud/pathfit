import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/practicum/1` }
    });
  };

  return (
    <div className="min-h-screen bg-fbGray flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-fbOrange rounded-2xl rotate-3 shadow-lg mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-3xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-extrabold text-fbNavy mb-2">PATHFit Pro</h1>
        <p className="text-gray-500 text-sm mb-8">Sign in to track your university fitness progress.</p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-3 rounded-xl font-bold text-fbNavy hover:bg-gray-50 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebase/anonymous-scan.png" className="w-5 h-5 opacity-0" alt="" />
          <span className="bg-clip-text">Login with Google</span>
        </button>
      </div>
    </div>
  );
}
