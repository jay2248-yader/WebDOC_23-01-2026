/**
 * FieldError component for displaying field-specific error messages
 * @param {Object} props
 * @param {string} props.error - Error message to display
 */
export default function FieldError({ error }) {
  if (!error) return null;

  return (
    <p className="text-red-300 text-sm mt-1 ml-1">
      {error}
    </p>
  );
}
