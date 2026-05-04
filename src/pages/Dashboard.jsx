import BubbleChart from '../components/dashboard/BubbleChart';
import BarChart from '../components/dashboard/BarChart';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <BubbleChart />
      <BarChart />
    </div>
  );
}
