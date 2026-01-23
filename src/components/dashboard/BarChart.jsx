import Card from '../common/Card';

/**
 * BarChart - Placeholder for bar chart visualization
 * TODO: Integrate with real charting library (e.g., Chart.js, Recharts)
 */
export default function BarChart() {
  const data = [
    { year: '2025', value: 10 },
    { year: '2026', value: 15 },
    { year: '2027', value: 12 },
    { year: '2028', value: 18 },
    { year: '2029', value: 8 },
    { year: '2030', value: 5 },
    { year: '2031', value: 14 },
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">ຈຳນວນເອກະສານຕາມປີ</h3>
      
      {/* Bar Chart Container */}
      <div className="flex items-end justify-between h-56 gap-2">
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100;
          const isHighest = item.value === maxValue;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div 
                className={`w-full ${isHighest ? 'bg-blue-700' : 'bg-blue-400'} rounded-t transition-all duration-300 hover:opacity-80`}
                style={{ height: `${heightPercent}%` }}
              ></div>
              
              {/* Year Label */}
              <span className="text-xs text-gray-600">{item.year}</span>
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <span>0</span>
        <span>10K</span>
        <span>20K</span>
        <span>30K</span>
      </div>
    </Card>
  );
}
