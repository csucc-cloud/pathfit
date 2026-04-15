/**
 * Calculates the completion percentage based on the number of exercises logged.
 * @param {Object} logData - The key-value pairs of exercise data.
 * @param {number} totalExercises - Default is 15 based on the curriculum.
 * @returns {number} - Percentage rounded to the nearest whole number.
 */
export const calculateProgress = (logData, totalExercises = 15) => {
  if (!logData) return 0;
  
  // Count how many exercises have at least one set value entered
  const completedCount = Object.values(logData).filter(sets => 
    sets.set1 || sets.set2 || sets.set3
  ).length;

  return Math.round((completedCount / totalExercises) * 100);
};

/**
 * Returns a color class based on the progress percentage.
 * @param {number} percentage 
 * @returns {string} - Tailwind color class
 */
export const getProgressColor = (percentage) => {
  if (percentage === 100) return 'text-green-500';
  if (percentage > 50) return 'text-fbOrange';
  if (percentage > 0) return 'text-fbAmber';
  return 'text-gray-400';
};
