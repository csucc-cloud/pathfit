import React from 'react';

export default function Layout({ children, title }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9]">
      {/* Top Navigation Bar */}
      <nav className="bg-[#051e34] text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="font-black tracking-tighter text-xl">PATHFit <span className="text-[#039be5]">PRO</span></span>
          <div className="text-xs bg-[#039be5] px-2 py-1 rounded font-bold uppercase">Curriculum 2026</div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
        {title && <h1 className="text-3xl font-extrabold text-[#051e34] mb-8">{title}</h1>}
        {children}
      </main>

      {/* Bottom Padding for Fixed Buttons */}
      <div className="h-24"></div>
    </div>
  );
}
