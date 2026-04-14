import React from 'react';

/**
 * PATHFit Pro: ExerciseCard
 * Optimized for tablet use in gym environments.
 * Dynamically renders 2 or 3 sets based on the curriculum constants.
 */
export default function ExerciseCard({ exercise, onUpdate }) {
  // Logic to generate the correct number of input fields (Sets)
  const setArray = Array.from({ length: exercise.sets }, (_, i) => i + 1);

  return (
    <div className="fb-card mb-6 border-l-4 border-[#039be5] transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="bg-[#051e34] p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg tracking-tight">
            {exercise.name}
          </h3>
          <span className="text-[#039be5] text-[10px] font-black uppercase tracking-[0.2em]">
            {exercise.category}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-gray-400 uppercase font-bold">Goal</span>
          <span className="text-white font-mono text-sm">
            {exercise.target} {exercise.unit}
          </span>
        </div>
      </div>
      
      {/* Input Section */}
      <div className="p-5 bg-white">
        <div className={`grid gap-4 ${exercise.sets === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {setArray.map((setNum) => (
            <div key={setNum} className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 text-center tracking-widest">
                Set {setNum}
              </label>
              <input
                type="number"
                inputMode="decimal"
                placeholder={exercise.unit === 'reps' ? '0' : 'Sec'}
                className="fitness-input"
                onChange={(e) => onUpdate(exercise.id, setNum, e.target.value)}
              />
            </div>
          ))}
        </div>
        
        {/* Unit Helper Footer */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px]">
          <span className="text-gray-400 uppercase font-bold italic">
            Unit: {exercise.unit === 'reps' ? 'Repetitions' : 'Seconds (Time)'}
          </span>
          <span className="text-[#039be5] font-bold">
            Practicum Entry
          </span>
        </div>
      </div>
    </div>
  );
}
