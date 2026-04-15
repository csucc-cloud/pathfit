import React, { useState } from 'react';
import Layout from '../../components/Layout';
import ExerciseCard from '../../components/ExerciseCard';
import { PATHFIT_EXERCISES } from '../../constants/exercises';

export default function PracticumLog() {
  const [progress, setProgress] = useState(0);

  return (
    <Layout>
      <main className="p-4 md:p-10">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-fbNavy">Exercise Log: Practicum 1</h2>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-sm text-gray-500 font-medium">Daily set tracking progress</p>
              <div className="w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-fbOrange h-full transition-all duration-500" 
                  style={{ width: `${(progress / 15) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-fbOrange uppercase tracking-tighter">
                {progress} / 15 DONE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-fbOrange hover:bg-fbOrange/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-fbOrange/20 transition-all flex items-center gap-2 active:scale-95">
              <span>💾</span> Save Changes
            </button>
          </div>
        </header>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PATHFIT_EXERCISES.map((ex) => (
            <ExerciseCard 
              key={ex.id} 
              exercise={ex} 
              onChange={() => setProgress(prev => Math.min(prev + 1, 15))} 
            />
          ))}
        </div>
      </main>
    </Layout>
  );
}
