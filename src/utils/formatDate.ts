/**
 * Format a date string to "Mon YYYY" format (e.g., "Jan 2025").
 * Returns null if the input is falsy.
 */
export const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};
