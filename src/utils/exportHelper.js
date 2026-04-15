// src/utils/exportHelper.js

/**
 * Converts JSON data to CSV format and triggers a browser download.
 * Preserves original mapping logic and Blob configuration.
 */
export const downloadCSV = (data, fileName) => {
  // Prevent execution during SSR (Server Side Rendering)
  if (typeof window === 'undefined') return;
  
  if (data.length === 0) return;

  // Your original header extraction logic
  const headers = Object.keys(data[0]).join(',');
  
  // Your original row mapping logic with quote encapsulation
  const rows = data.map(row => 
    Object.values(row).map(value => `"${value}"`).join(',')
  );

  // Consolidating content into a single string
  const csvContent = [headers, ...rows].join('\n');
  
  // Creating the file blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Triggering the browser download sequence
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object to free up memory
  URL.revokeObjectURL(url);
};
