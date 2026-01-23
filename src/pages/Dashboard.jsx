import StatsGrid from '../components/dashboard/StatsGrid';
import BubbleChart from '../components/dashboard/BubbleChart';
import BarChart from '../components/dashboard/BarChart';

export default function Dashboard() {
  // Mock data for stats
  const stats = [
    {
      label: 'User',
      value: 150,
      icon: '👥',
      percentage: '30% ລົດລ',
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Admin',
      value: 15,
      icon: '👤',
      percentage: '30% ລົດລ',
      bgColor: 'bg-blue-500',
    },
    {
      label: 'ເອກສານ',
      value: 100,
      icon: '🛡️',
      percentage: '-1% ລົດລ',
      bgColor: 'bg-blue-500',
    },
    {
      label: 'ລາຍການ',
      value: 100,
      icon: '📋',
      percentage: '-1% ລົດລ',
      bgColor: 'bg-blue-500',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bubble Chart */}
        <BubbleChart />

        {/* Bar Chart */}
        <BarChart />
      </div>
    </div>
  );
}
