import Card from '../common/Card';

/**
 * StatCard - Display statistics with icon and value
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {number|string} props.value - Stat value
 * @param {string} props.icon - Icon/emoji to display
 * @param {string} props.percentage - Percentage text (e.g., "30% ລົດລ")
 * @param {string} props.bgColor - Background color for icon
 */
export default function StatCard({ label, value, icon, percentage, bgColor = 'bg-blue-500' }) {
  return (
    <Card className="flex flex-col items-center text-center">
      {/* Icon */}
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center text-white text-3xl mb-4`}>
        {icon}
      </div>

      {/* Label */}
      <p className="text-sm text-gray-600 mb-2">{label}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>

      {/* Percentage */}
      {percentage && (
        <p className="text-xs text-gray-500">{percentage}</p>
      )}
    </Card>
  );
}
