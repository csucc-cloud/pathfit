// src/components/ExerciseCard.jsx
import React from 'react';
// Importing icons to match the high-end dashboard feel
import { Dumbbell, Target, CheckCircle2, ChevronRight } from 'lucide-react';

const ExerciseCard = ({ exercise, values, onChange }) => {
  const { id, name, reps, sets, unit } = exercise;

  // Generate an array based on the "sets" property (2 or 3)
  const setInputs = Array.from({ length: sets }, (_, i) => i + 1);

  // Helper to check if all sets for this card are completed
  const isFullyLogged = setInputs.every(num => values?.[`set${num}`]);

  return (
    <div className={`bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 group ${
      isFullyLogged ? 'border-fbOrange/30' : 'border-gray-100'
    }`}>
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-extrabold text-fbNavy text-lg group-hover:text-fbOrange transition-colors">
            {name}
          </h4>
          {isFullyLogged ? (
            <CheckCircle2 className="w-5 h-5 text-fbOrange animate-in zoom-in" />
          ) : (
            <Dumbbell className="w-4 h-4 text-gray-200 group-hover:text-fbOrange/40 transition-colors" />
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <Target className="w-3 h-3 text-fbOrange" />
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black">
            TARGET: {reps} {unit.toUpperCase()} • {sets} SETS
          </p>
        </div>
      </div>

      {/* Dynamic Input Grid */}
      <div className={`grid gap-3 mt-8 ${sets === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {setInputs.map((setNum) => (
          <div key={setNum} className="flex flex-col">
            <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1 flex items-center gap-1">
              <ChevronRight className="w-2 h-2 text-fbOrange" />
              Set {setNum}
            </label>
            <input 
              type="number" 
              placeholder="-"
              value={values?.[`set${setNum}`] || ''}
              onChange={(e) => onChange(id, `set${setNum}`, e.target.value)}
              className="w-full bg-fbGray border-2 border-transparent rounded-xl py-3 text-center text-sm font-bold text-fbNavy focus:border-fbOrange focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseCard;
