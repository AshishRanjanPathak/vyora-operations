/**
 * Utility to convert an array of JSON objects into downloadable CSV.
 *
 * @param {Array<Object>} data
 * @param {string} filename
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Extract keys from first object
  const headers = Object.keys(data[0]);

  // Construct CSV rows
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}