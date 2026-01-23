/**
 * ErrorMessage component for displaying general error messages
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} props.className - Optional additional CSS classes
 */
export default function ErrorMessage({ message, className = '' }) {
  if (!message) return null;

  return (
    <div className={`bg-red-500/20 border border-red-400 text-red-100 px-4 py-2 rounded-lg text-sm ${className}`}>
      {message}
    </div>
  );
}
