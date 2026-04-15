import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    fullName: '',
    age: '',
    sex: 'Male',
    course: '',
    sectionCode: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { student_id: formData.studentId } // Stores ID in metadata
      }
    });

    if (authError) return alert(authError.message);

    // 2. If Auth is successful, insert the details into our Profiles table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          student_id: formData.studentId,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          sex: formData.sex,
          course: formData.course,
          section_code: formData.sectionCode
        }]);

      if (profileError) {
        alert("Auth created, but profile failed: " + profileError.message);
      } else {
        alert("Account Created! You can now log in.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl mt-10">
      <h1 className="text-2xl font-black text-fbNavy mb-6">Create Student Account</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input type="text" placeholder="Student ID (e.g. 2024-0001)" className="w-full p-3 bg-fbGray rounded-xl outline-none font-bold" 
          onChange={(e) => setFormData({...formData, studentId: e.target.value})} required />
        
        <input type="text" placeholder="Full Name" className="w-full p-3 bg-fbGray rounded-xl outline-none" 
          onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />

        <div className="flex gap-4">
          <input type="number" placeholder="Age" className="w-1/2 p-3 bg-fbGray rounded-xl outline-none" 
            onChange={(e) => setFormData({...formData, age: e.target.value})} />
          
          <select className="w-1/2 p-3 bg-fbGray rounded-xl outline-none font-bold"
            onChange={(e) => setFormData({...formData, sex: e.target.value})}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <input type="text" placeholder="Course (e.g. BSIT)" className="w-full p-3 bg-fbGray rounded-xl outline-none" 
          onChange={(e) => setFormData({...formData, course: e.target.value})} />

        <input type="text" placeholder="Section Code" className="w-full p-3 bg-fbGray rounded-xl outline-none" 
          onChange={(e) => setFormData({...formData, sectionCode: e.target.value})} />

        <hr className="my-4 border-gray-100" />

        <input type="email" placeholder="Email Address" className="w-full p-3 bg-fbGray rounded-xl outline-none" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        
        <input type="password" placeholder="Password" className="w-full p-3 bg-fbGray rounded-xl outline-none" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} required />

        <button type="submit" className="w-full bg-fbOrange text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
          Submit Enrollment
        </button>
      </form>
    </div>
  );
}
