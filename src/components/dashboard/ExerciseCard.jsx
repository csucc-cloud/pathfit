import React from 'react';

export default function ExerciseCard({ exercise, onUpdate }) {
  // Generates 2 or 3 inputs based on the exercise definition
  const setArray = Array.from({ length: exercise.sets }, (_, i) => i + 1);

  return (
    <div className="fb-card mb-4">
      <div className="bg-[#051e34] p-3">
        <h3 className="text-white font-medium flex justify-between">
          {exercise.name}
          <span className="text-[#039be5] text-sm uppercase">{exercise.category}</span>
        </h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {setArray.map((setNum) => (
            <div key={setNum}>
              <label className="text-xs text-gray-500 uppercase block mb-1">
                Set {setNum}
              </label>
              <input
                type="number"
                placeholder={exercise.unit}
                className="fitness-input text-center"
                onChange={(e) => onUpdate(exercise.id, setNum, e.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400 italic">
          Target: {exercise.target} {exercise.unit} per set
        </p>
      </div>
    </div>
  );
}
