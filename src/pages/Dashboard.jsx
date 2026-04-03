import ProgressTracking from '../components/sttp/ProgressTracking';
import WeaknessDashboard from '../components/sttp/WeaknessDashboard';

export default function Dashboard() {
  return (
    <div className="flex flex-col space-y-0 -mt-12">
      <ProgressTracking />
      <div className="-mt-32">
        <WeaknessDashboard />
      </div>
    </div>
  );
}
