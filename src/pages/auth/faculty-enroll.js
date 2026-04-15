import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function InstructorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    fullName: '',
    department: 'PE Department',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) return alert(authError.message);

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('instructors')
        .insert([{
          id: authData.user.id,
          employee_id: formData.employeeId,
          full_name: formData.fullName,
          department: formData.department
        }]);

      if (profileError) {
        alert("Auth created, but Instructor record failed: " + profileError.message);
      } else {
        alert("Instructor Account Verified!");
        router.push('/'); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-fbNavy flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-fbNavy mb-6 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-fbOrange p-3 rounded-2xl shadow-lg shadow-fbOrange/30">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-fbNavy uppercase leading-tight">Faculty Portal</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instructor Enrollment</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Employee ID (e.g. EMP-2026)" className="w-full p-4 bg-fbGray rounded-2xl outline-none font-bold focus:ring-2 focus:ring-fbOrange transition-all" 
            onChange={(e) => setFormData({...formData, employeeId: e.target.value})} required />
          
          <input type="text" placeholder="Full Name (with Titles)" className="w-full p-4 bg-fbGray rounded-2xl outline-none font-bold focus:ring-2 focus:ring-fbOrange transition-all" 
            onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />

          <select className="w-full p-4 bg-fbGray rounded-2xl outline-none font-bold text-fbNavy focus:ring-2 focus:ring-fbOrange transition-all"
            onChange={(e) => setFormData({...formData, department: e.target.value})}>
            <option value="PE Department">PE Department</option>
            <option value="College of Sports Science">College of Sports Science</option>
            <option value="Athletics Office">Athletics Office</option>
          </select>

          <hr className="my-4 border-gray-100" />

          <input type="email" placeholder="Faculty Email" className="w-full p-4 bg-fbGray rounded-2xl outline-none focus:ring-2 focus:ring-fbOrange transition-all" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          
          <input type="password" placeholder="Secure Password" className="w-full p-4 bg-fbGray rounded-2xl outline-none focus:ring-2 focus:ring-fbOrange transition-all" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} required />

          <button type="submit" className="w-full bg-fbNavy text-white font-black py-4 rounded-2xl shadow-xl hover:bg-fbOrange transition-all transform active:scale-95">
            VERIFY FACULTY ACCESS
          </button>
        </form>
      </div>
    </div>
  );
}
