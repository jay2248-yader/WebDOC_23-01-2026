import Card from '../common/Card';

/**
 * BubbleChart - Placeholder for bubble chart visualization
 * TODO: Integrate with real charting library (e.g., Chart.js, Recharts)
 */
export default function BubbleChart() {
  const bubbles = [
    { size: 'large', label: '55%', color: 'bg-blue-800', top: '40%', left: '50%' },
    { size: 'medium', label: '22%', color: 'bg-blue-300', top: '20%', left: '30%' },
    { size: 'medium', label: '11%', color: 'bg-blue-400', top: '60%', left: '35%' },
    { size: 'medium', label: '8%', color: 'bg-blue-200', top: '15%', left: '55%' },
    { size: 'small', label: '2%', color: 'bg-blue-500', top: '35%', left: '48%' },
    { size: 'small', label: '13%', color: 'bg-blue-200', top: '45%', left: '15%' },
  ];

  const getSizeClass = (size) => {
    switch (size) {
      case 'large': return 'w-40 h-40';
      case 'medium': return 'w-24 h-24';
      case 'small': return 'w-16 h-16';
      default: return 'w-20 h-20';
    }
  };

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">ຈຳນວນເອກະສານຕາມປັກຜິດ</h3>
      
      {/* Bubble Chart Container */}
      <div className="relative h-64">
        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className={`absolute ${getSizeClass(bubble.size)} ${bubble.color} rounded-full 
              flex items-center justify-center text-white font-bold shadow-lg
              transform -translate-x-1/2 -translate-y-1/2`}
            style={{ top: bubble.top, left: bubble.left }}
          >
            {bubble.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-800 rounded-full"></span>
          <span>ໃນສະໝັງ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-300 rounded-full"></span>
          <span>ນັດລາຍງານ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
          <span>ສັ່ງ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-200 rounded-full"></span>
          <span>ແບ່ງສຳເຫນົ່າ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span>ເກັດຊິ່ສຕລົງຜນ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-200 rounded-full"></span>
          <span>ປັນຜັກກາວສຸ່ລະສູ</span>
        </div>
      </div>
    </Card>
  );
}
