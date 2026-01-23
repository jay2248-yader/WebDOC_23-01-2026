/**
 * Card component - Reusable card wrapper with optional shadows and padding
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.noPadding - Remove default padding
 */
export default function Card({ children, className = '', noPadding = false }) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
