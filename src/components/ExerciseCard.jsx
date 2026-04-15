// src/components/ExerciseCard.jsx
import React from 'react';

const ExerciseCard = ({ exercise, values, onChange }) => {
  const { id, name, reps, sets, unit } = exercise;

  // Generate an array based on the "sets" property (2 or 3)
  const setInputs = Array.from({ length: sets }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
      <div>
        <h4 className="font-extrabold text-fbNavy text-lg group-hover:text-fbOrange transition-colors">
          {name}
        </h4>
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-black mt-1">
          TARGET: {reps} {unit.toUpperCase()} • {sets} SETS
        </p>
      </div>

      {/* Dynamic Input Grid */}
      <div className={`grid gap-3 mt-8 ${sets === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {setInputs.map((setNum) => (
          <div key={setNum} className="flex flex-col">
            <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 ml-1">
              Set {setNum}
            </label>
            <input 
              type="number" 
              placeholder="-"
              value={values?.[`set${setNum}`] || ''}
              onChange={(e) => onChange(id, `set${setNum}`, e.target.value)}
              className="w-full bg-fbGray border-2 border-transparent rounded-xl py-3 text-center text-sm font-bold text-fbNavy focus:border-fbOrange focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseCard;
